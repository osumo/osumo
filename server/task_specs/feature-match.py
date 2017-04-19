"""Compute a feature matching between two data sets."""

# include<lib/csv.py>

import collections
import json

import itertools as it
import numpy as np

from functools import wraps

from scipy import optimize
from Levenshtein import jaro

# ifdef<LINTING>
from included_files import get_dialect, ColumnExtractor, RowExtractor
from girder_worker_environment import input_path_1, input_path_2, match_spec
# endif

AssignmentResult = collections.namedtuple(
    'AssignmentResult', ('assignments', 'score'))


def compute_assignments(list1, list2, metric=None):
    """Compute the optimal feature match assignments for the given metric."""
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
                        {'index': i, 'value': list1[i]},
                        {'index': j, 'value': list2[j]}
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
    """Create a higher-tier metric based on the given metric.

    Creates a higher-tier metric based on the given metric.  For a given metric
    that accepts an iterable of type T, this decorator returns a metric that
    accepts an iterable of such iterables (of type T).  The resulting metric is
    computed by pairing the (sub)iterables in each iterable, taking the score
    from the original metric for each pair, and aggregating them into a new
    overall score.  The pairing is chosen such that the overall score returned
    is maximized.

    See transform_metric() and split_string() for an example of how to construct
    a metric that first translates an iterable into an iterable of iterables
    that can then be used with a metric produced with this decorator.
    """
    if metric is None:
        metric = jaro

    @wraps(metric)
    def result(a_list, b_list):
        return compute_assignments(a_list, b_list, metric).score
    return result


def sliding_metric(metric=None):
    """Create a metric that tries different substring alignments.

    Creates a new metric based on the given metric.  The new metric uses the
    given metric, but tries different substring and alignment configurations in
    an effort to lessen the weight of misaligned substrings.

    Note that this decorator uses a heuristic that has not been rigorously
    evaluated.  Any observation of its effectiveness or lack thereof for any
    particular class of dataset is strictly empirical.
    """
    if metric is None:
        metric = jaro

    def metric_eval(a, b, pad, off):
        n = len(a) + 2 * pad

        return metric(
            '{}{}{}'.format(
                b[off:off + pad],
                a,
                b[off + n - pad:off + n]
            ),
            b[off:off + n]
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
                    for offset in range(bn - an - 2 * padding + 1)
                )
                for padding in range((bn - an) // 2 + 1)
            )
        )

        weight = 1.0 / (2 + bn - an)
        return (1.0 - weight) * result + weight * metric(a, b)
    return result


def transform_metric(transformer=None):
    """Create a metric that transforms its input before evaluating."""
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
    """Split a string into substrings consisting only of letters or numbers.

    Splits a string into substrings consisting only of letters or numbers.  For
    the given string, consider all possible contiguous substrings that are made
    up of only letters or only numbers (but not a mix of letters and numbers).
    Then, consider all the characters in the given string that are featured in
    at least one such substring.  The returned substrings are such that:

    1 - Every featured character in the given string features in exactly one
        returned substring, and

    2 - The number of returned substrings is minimized.  I.e.: two smaller,
        consecutive substrings both consisting of only letters or both
        consisting of only numbers would never be returned; they would both be
        part of a single, larger substring.
    """
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
    """The main metric used in this script.

    Adjust the sequence of decorators to try different function compositions.
    """
    return jaro(a, b)

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
