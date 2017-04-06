
import collections
import csv
import json

import itertools as it
import numpy as np
import scipy as sp

from functools import wraps
from time import time
from scipy import optimize
from Levenshtein import jaro

ROW_SCAN_SIZE = 1024

SNIFFER_SIZE = 1024
SNIFFER_NUM_LINES = 3
SNIFFER_DELIMITERS = ',;\t\n|'

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

    return [x for x in result if x]


class ColumnExtractor(object):
    def __init__(self, file, dialect):
        self.file = file
        self.dialect = dialect
        self.reader = csv.reader(file, dialect)
        self._columns = None
        self._index = None

    def _get_columns(self):
        if self._columns is None:
            self._columns = next(self.reader)[1:]

        return self._columns

    def next(self):
        self._get_columns()

        if self._index is None:
            self._index = 0
        else:
            self._index += 1

        result = self._columns[self._index:self._index + 1]
        if not result:
            raise StopIteration

        return result[0]

    def __iter__(self):
        return self


class RowExtractor(object):
    def __init__(self, file, dialect):
        self.file = file
        self.dialect = dialect

    def next(self):
        read_until(self.file, '\n')
        field = read_until(self.file, self.dialect.delimiter)
        if not field:
            raise StopIteration

        if (
                field[0] == field[-1] and
                field[0] == self.dialect.quotechar and
                self.dialect.quoting):
            field = field[1:-1]

        return field

    def __iter__(self):
        return self


def read_until(f, char, num=1):
    result = ''
    if num > 0:
        while True:
            sample = f.read(SNIFFER_SIZE)
            if not sample:
                break

            num -= sum(1 if c == char else 0 for c in sample)
            result += sample

            if num <= 0:
                break

        while num <= 0:
            n = result.rfind(char)

            if n < 0:
                break

            n -= len(result)
            f.seek(n, 1)
            result = result[:n]
            num += 1

    return result + f.read(1)


@transform_metric(split_string)
@combinatorial_match_metric
@sliding_metric
def main_metric(a, b):
    return jaro(a, b)

# # uncomment to test in the command line
# from sys import argv
# input_path_1 = argv[1]
# input_path_2 = argv[2]
# matches      = argv[3]

matches = set(match.strip() for match in matches.lower().split(','))

dialect1 = None
dialect2 = None
if matches:
    with open(input_path_1, 'rU') as input1:
        dialect1 = csv.Sniffer().sniff(
            read_until(input1, '\n', SNIFFER_NUM_LINES),
            delimiters=SNIFFER_DELIMITERS
        )
    with open(input_path_2, 'rU') as input2:
        dialect2 = csv.Sniffer().sniff(
            read_until(input2, '\n', SNIFFER_NUM_LINES),
            delimiters=SNIFFER_DELIMITERS
        )

match_result = {}
for mode in matches:
    (mode1, mode2) = mode
    if mode1 not in 'rc' or mode2 not in 'rc':
        continue

    list1 = None
    with open(input_path_1, 'rU') as input1:
        list1 = [
            x for x in (
                ColumnExtractor if mode1 == 'c' else RowExtractor
            )(input1, dialect1)
        ]

    list2 = None
    with open(input_path_2, 'rU') as input2:
        list2 = [
            x for x in (
                ColumnExtractor if mode2 == 'c' else RowExtractor
            )(input2, dialect2)
        ]

    assignments = compute_assignments(list1, list2, main_metric)

    match_result[mode] = {
        'score': assignments.score,
        'assignments': assignments.assignments
    }

match_result = json.dumps(match_result)

