
import csv
import json
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

selections = set(json.loads(selections))
dialect = None
sliced_output = 'sliced-output.csv'
with open(input_path, 'rU') as input_f:
    dialect = csv.Sniffer().sniff(
        read_until(input_f, '\n', SNIFFER_NUM_LINES),
        delimiters=SNIFFER_DELIMITERS
    )

with open(input_path, 'rU') as input_f:
    reader = csv.reader(input_f, dialect)

    output_f = None
    if PY2:
        output_f = open(sliced_output, 'wb')
    else:
        output_f = open(sliced_output, 'w', newline='')

    with output_f:
        writer = csv.writer(output_f, dialect=dialect)

        if slice_columns:
            indexes = []
            columns = next(reader)

            for (index, column) in enumerate(columns):
                if index == 0:
                    continue

                if index == 0 or column in selections:
                    indexes.append(index)

            # write header row
            writer.writerow([columns[i] for i in indexes])

            for row in reader:
                writer.writerow([row[i] for i in indexes])
        else:
            # write header row
            writer.writerow(next(reader))

            for row in reader:
                if row[0] in selections:
                    writer.writerow(row)

