"""Extract a subset of the given data set."""

# include<lib/csv.py>

import csv
import json
from six import PY2

# ifdef<LINTING>
from included_files import get_dialect
from girder_worker_environment import input_path, selections, slice_columns
# endif

selections = set(json.loads(selections))
dialect = None
sliced_output = 'sliced-output.csv'
dialect = get_dialect(input_path)

with open(input_path, 'rU') as input_f:
    reader = csv.reader(input_f, dialect)

    output_f = None
    if PY2:
        output_f = open(sliced_output, 'wb')
    else:
        output_f = open(sliced_output, 'w', newline='')

    with output_f:
        writer = csv.writer(output_f, dialect=csv.excel)

        if slice_columns:
            indexes = []
            columns = next(reader)

            for (index, column) in enumerate(columns):
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
