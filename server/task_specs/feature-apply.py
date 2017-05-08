"""Apply a previously-computed feature matching to the given data sets."""

import csv
import json

# include<lib/csv.py>

# ifdef<LINTING>
from included_files import get_dialect, read_csv, write_csv
from girder_worker_environment import input_path_1, input_path_2, match_json
# endif


def main(
        input_path_1, input_path_2,
        match_input_path, output_path_1,
        output_path_2):
    """Main entry point."""
    dialect_1 = get_dialect(input_path_1)
    dialect_2 = get_dialect(input_path_2)

    data1, rows1, columns1, corner1 = read_csv(input_path_1, dialect_1)
    data2, rows2, columns2, corner2 = read_csv(input_path_2, dialect_2)

    try:
        match_results = json.loads(match_input_path)
    except Exception:
        with open(match_input_path) as f:
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

    new_cols1 = columns1[index1]
    new_data1 = data1[:, index1]

    new_cols2 = columns2[index2]
    new_data2 = data2[:, index2]

    write_csv(new_data1, rows1, new_cols1, corner1, output_path_1, csv.excel)
    write_csv(new_data2, rows2, new_cols2, corner2, output_path_2, csv.excel)

output_path_1 = 'output_1.csv'
output_path_2 = 'output_2.csv'
main(input_path_1, input_path_2, match_json, output_path_1, output_path_2)
