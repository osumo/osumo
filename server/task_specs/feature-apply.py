
import csv
import json

import numpy as np
from six import PY2

SNIFFER_SIZE = 1024
SNIFFER_NUM_LINES = 3
SNIFFER_DELIMITERS = ',;\t\n|'

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

def get_dialect(input_path):
    dialect = None
    with open(input_path, 'rU') as input:
        dialect = csv.Sniffer().sniff(
            read_until(input, '\n', SNIFFER_NUM_LINES),
            delimiters=SNIFFER_DELIMITERS)
    return dialect

def make_float(x):
    try:
        return float(x)
    except ValueError:
        return np.nan

def read_csv(input_path, dialect):
    row_headers, column_headers, data_block = None, None, None
    with open(input_path, 'rU') as f:
        reader = csv.reader(f, dialect=dialect)
        column_headers = list(next(reader))[1:]
        row_headers, data_block = zip(
            *(
                [row[0], row[1:]]
                for row in (
                    list(list(row2) for row2 in reader)
                )
            )
        )

        row_headers = np.array(list(row_headers))
        column_headers = np.array(list(column_headers))
        data_block = np.array(
            [
                [make_float(scalar) for scalar in row]
                for row in data_block
            ],
            dtype=np.float64
        )

    return data_block, row_headers, column_headers

def write_csv_helper(data_block, row_headers, column_headers, f, dialect):
    writer = csv.writer(f, dialect=dialect)
    writer.writerow([''] + list(column_headers))
    for row in zip(row_headers, data_block):
        writer.writerow([row[0]] + list(row[1]))

def write_csv(data_block, row_headers, column_headers, output_path, dialect):
    if PY2:
        with open(output_path, 'wb') as f:
            write_csv_helper(
                    data_block, row_headers, column_headers, f, dialect)
    else:
        with open(output_path, 'w', newline='') as f:
            write_csv_helper(
                    data_block, row_headers, column_headers, f, dialect)

# # uncomment to test in the command line
# from sys import argv
# input_path_1      = argv[1]
# input_path_2      = argv[2]
# match_input_path  = argv[3]
# output_path_1     = argv[4]
# output_path_2     = argv[5]

output_path_1 = 'output_1.csv'
output_path_2 = 'output_2.csv'

dialect_1 = get_dialect(input_path_1)
dialect_2 = get_dialect(input_path_2)

data1, rows1, columns1 = read_csv(input_path_1, dialect_1)
data2, rows2, columns2 = read_csv(input_path_2, dialect_2)

try:
    match_results = json.loads(match_json)
except Exception:
    with open(match_json) as f:
        match_results = json.load(f)

mode1, mode2 = match_results.get('mode', 'cc').lower()

if mode1 == 'r':
    data1 = data1.transpose()
    rows1, columns1 = columns1, rows1

if mode2 == 'r':
    data2 = data2.transpose()
    rows2, columns2 = columns2, rows2

index1, index2 = zip(
    *(
        tuple(p['index'] for p in assign['pair'][:2])
        for assign in match_results.get('assignments', [])
    )
)

index1 = list(index1)
index2 = list(index2)

new_rows1 = rows1[index1]
new_cols1 = columns1[index1]
new_data1 = data1[:, index1]

new_rows2 = rows2[index2]
new_cols2 = columns2[index2]
new_data2 = data2[:, index2]

write_csv(new_data1, new_rows1, new_cols1, output_path_1, dialect_1)
write_csv(new_data2, new_rows2, new_cols2, output_path_2, dialect_2)
