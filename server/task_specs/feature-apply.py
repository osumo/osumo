@include<lib/csv.py>

import json

def main(input_path_1, input_path_2, match_input_path,
        output_path_1, output_path_2):

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

if __name__ == '__main__':
    from sys import argv
    input_path_1 = argv[1]
    input_path_2 = argv[2]
    match_input_path = argv[3]
    output_path_1 = argv[4]
    output_path_2 = argv[5]
else:
    output_path_1 = 'output_1.csv'
    output_path_2 = 'output_2.csv'

main(input_path_1, input_path_2, match_input_path, output_path_1, output_path_2)
