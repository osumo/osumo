"""Remove headers from columns & rows."""

import csv
from six import PY2
from tempfile import NamedTemporaryFile

# include<lib/csv.py>

# ifdef<LINTING>
from included_files import get_dialect
from girder_worker_environment import input_path
# endif

dialect = get_dialect(input_path)

with open(input_path, 'rU') as input_f:
    reader = csv.reader(input_f, dialect)

    output_f = None
    if PY2:
        output_f = NamedTemporaryFile(mode='wb', delete=False)
    else:
        output_f = NamedTemporaryFile(mode='w', newline='', delete=False)

    output_path = output_f.name

    with output_f:
        writer = csv.writer(output_f, dialect=csv.excel)

        # Unconditionally skip the first row and
        # the first value in every subsequent row.

        # next(reader)
        writer.writerow([
            'V{}'.format(index + 1)
            for (index, _) in enumerate(next(reader)[1:])
        ])
        for row in reader:
            writer.writerow(row[1:])
