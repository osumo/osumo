@include<lib/csv.py>

import collections
import json

import itertools as it
import numpy as np

from scipy import optimize
from Levenshtein import jaro

AssignmentResult = collections.namedtuple(
        'AssignmentResult', ('assignments', 'score'))

def compute_assignments(list1, list2, metric=None):
    if metric is None:
        metric = jaro

    cost_matrix = np.array(
        tuple(
            tuple(
                1.0 - metric(matrix_row_entry, matrix_column_entry)
                for matrix_column_entry in list2
            )
            for matrix_row_entry in list1
        )
    )

    assign1, assign2 = (
            optimize.linear_sum_assignment(cost_matrix))

    result = AssignmentResult(
        score=np.mean(1.0 - cost_matrix[assign1, assign2]),
        assignments=sorted(
            [
                {
                    'pair': [
                        { 'index': i, 'value': list1[i] },
                        { 'index': j, 'value': list2[j] }
                    ],

                    'score': 1.0 - cost_matrix[i, j]
                }
                for (i, j) in zip(assign1, assign2)
            ],

            key=lambda x: -x['score']
        )
    )

    return result


def combinatorial_match_metric(metric=None):
    if metric is None:
        metric = jaro

    @wraps(metric)
    def result(a_list, b_list):
        return compute_assignments(a_list, b_list, metric).score
    return result


def sliding_metric(metric=None):
    if metric is None:
        metric = jaro

    def metric_eval(a, b, pad, off):
        n = len(a) + 2*pad

        return metric(
            '{}{}{}'.format(
                b[off:off + pad],
                a,
                b[off + n - pad:off + n]
            ),
            b[off:off+n]
        )

    @wraps(metric)
    def result(a, b):
        an = len(a)
        bn = len(b)

        if an > bn:
            a, b = b, a
            an, bn = bn, an

        result = max(
            it.chain.from_iterable(
                (
                    metric_eval(a, b, padding, offset)
                    for offset in range(bn - an - 2*padding + 1)
                )
                for padding in range((bn - an)//2 + 1)
            )
        )

        weight = 1.0/(2 + bn - an)
        return (1.0 - weight)*result + weight*metric(a, b)
    return result

def transform_metric(transformer=None):
    if transformer is None:
        transformer = split_string

    def transform_metric_decorator(metric=None):
        if metric is None:
            metric = combinatorial_match_metric()

        @wraps(metric)
        def result(a, b):
            a2 = transformer(a)
            b2 = transformer(b)

            return metric(a2, b2)
        return result
    return transform_metric_decorator


def split_string(x):
    MODE_OPEN = 0
    MODE_TEXT = 1
    MODE_NUMERIC = 2

    mode = MODE_OPEN
    result = []
    current = []

    for c in x:
        if mode == MODE_OPEN:
            if (('a' <= c and c <= 'z') or
                    ('A' <= c and c <= 'Z')):
                mode = MODE_TEXT
                current.append(c.lower())

            if ('0' <= c and c <= '9'):
                mode = MODE_NUMERIC
                current.append(c.lower())

        elif mode == MODE_TEXT:
            if (('a' <= c and c <= 'z') or
                    ('A' <= c and c <= 'Z')):
                current.append(c.lower())
            elif ('0' <= c and c <= '9'):
                mode = MODE_NUMERIC
                result.append(''.join(current))
                current = [c]
            else:
                if current:
                    result.append(''.join(current))
                    current = []
                mode = MODE_OPEN

        elif mode == MODE_NUMERIC:
            if ('0' <= c and c <= '9'):
                current.append(c)
            elif (('a' <= c and c <= 'z') or
                    ('A' <= c and c <= 'Z')):
                mode = MODE_TEXT
                result.append(''.join(current))
                current = [c.lower()]
            else:
                if current:
                    result.append(''.join(current))
                    current = []
                mode = MODE_OPEN

    if current:
        result.append(''.join(current))

    return filter(None, result)

@transform_metric(split_string)
@combinatorial_match_metric
@sliding_metric
def main_metric(a, b):
    return jaro(a, b)

# # uncomment to test in the command line
# from sys import argv
# input_path_1 = argv[1]
# input_path_2 = argv[2]
# match_spec   = argv[3]

dialect1 = get_dialect(input_path_1)
dialect2 = get_dialect(input_path_2)

match_result = {}
match_spec = match_spec.lower()

(mode1, mode2) = (match_spec[0], match_spec[1])
if mode1 not in 'rc' or mode2 not in 'rc':
    raise ValueError('Invalid match specification')

list1 = None
extractor = ColumnExtractor if mode1 == 'c' else RowExtractor
with open(input_path_1, 'rU') as input1:
    list1 = list(extractor(input1, dialect1))

list2 = None
extractor = ColumnExtractor if mode2 == 'c' else RowExtractor
with open(input_path_2, 'rU') as input2:
    list2 = list(extractor(input2, dialect2))

assignments = compute_assignments(list1, list2, main_metric)

match_result = {
    'mode': match_spec,
    'score': assignments.score,
    'assignments': assignments.assignments
}

match_result = json.dumps(match_result)
