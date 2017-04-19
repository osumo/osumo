"""Extract the columns from one or two data sets."""

# include<lib/csv.py>

import json

# ifdef<LINTING>
from included_files import get_dialect, ColumnExtractor
from girder_worker_environment import input_path_1, input_path_2
# endif


dialect1 = get_dialect(input_path_1)
dialect2 = get_dialect(input_path_2)

list1 = None
with open(input_path_1, 'rU') as input1:
    list1 = list(ColumnExtractor(input1, dialect1))

list2 = None
with open(input_path_2, 'rU') as input2:
    list2 = list(ColumnExtractor(input2, dialect2))

values = (
    {'id': (a if len(a) < len(b) else b),
        'description': '{}/{}'.format(a, b)}
    for (a, b) in zip(list1, list2))

extract_result = list(sorted(values, key=(lambda x: x['id'])))

lastId = None
counter = 0
for entry in extract_result:
    if lastId is not None and lastId == entry['id']:
        entry['id'] = '{} ({})'.format(entry['id'], str(counter))
        counter += 1
    else:
        counter = 0
        lastId = entry['id']

extract_result = json.dumps(extract_result)
