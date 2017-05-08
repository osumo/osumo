"""Remove columns with missing/invalid data."""

import csv
import math

# include<lib/csv.py>

# ifdef<LINTING>
from included_files import get_dialect, read_csv, write_csv
from girder_worker_environment import input_path_1, input_path_2
# endif

dialect_1 = get_dialect(input_path_1)
dialect_2 = get_dialect(input_path_2)

data1, rows1, columns1, corner = read_csv(input_path_1, dialect_1)
data2, rows2, columns2, corner = read_csv(input_path_2, dialect_2)

invalid_indexes = set()

n_columns1 = len(columns1)
n_columns2 = len(columns2)

for column_index in range(max(n_columns1, n_columns2)):
    is_invalid = False

    if column_index < n_columns1:
        for row_index in range(len(rows1)):
            is_invalid = (
                math.isinf(data1[row_index][column_index]) or
                math.isnan(data1[row_index][column_index]))

            if is_invalid:
                break

    if not is_invalid and column_index < n_columns2:
        for row_index in range(len(rows2)):
            is_invalid = (
                math.isinf(data2[row_index][column_index]) or
                math.isnan(data2[row_index][column_index]))

            if is_invalid:
                break

    if is_invalid:
        invalid_indexes.add(column_index)

if invalid_indexes:
    data1 = [[
        x for (i, x) in enumerate(row)
        if i not in invalid_indexes
    ] for row in data1]

    data2 = [[
        x for (i, x) in enumerate(row)
        if i not in invalid_indexes
    ] for row in data2]

    columns1 = [x for (i, x) in enumerate(columns1)
                if i not in invalid_indexes]

    columns2 = [x for (i, x) in enumerate(columns2)
                if i not in invalid_indexes]

    output_path_1 = 'output_1.csv'
    output_path_2 = 'output_2.csv'

    write_csv(data1, rows1, columns1, corner, output_path_1, csv.excel)
    write_csv(data2, rows2, columns2, corner, output_path_2, csv.excel)
else:
    # if nothing to remove, then this script is a no-op
    output_path_1 = input_path_1
    output_path_2 = input_path_2
