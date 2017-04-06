
import csv
import json

SNIFFER_SIZE = 1024
SNIFFER_NUM_LINES = 3
SNIFFER_DELIMITERS = ',;\t\n|'

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


dialect1 = None
with open(input_path_1, 'rU') as input1:
    dialect1 = csv.Sniffer().sniff(
        read_until(input1, '\n', SNIFFER_NUM_LINES),
        delimiters=SNIFFER_DELIMITERS
    )

dialect2 = None
with open(input_path_2, 'rU') as input2:
    dialect2 = csv.Sniffer().sniff(
        read_until(input2, '\n', SNIFFER_NUM_LINES),
        delimiters=SNIFFER_DELIMITERS
    )


list1 = None
with open(input_path_1, 'rU') as input1:
    list1 = [x for x in ColumnExtractor(input1, dialect1)]

list2 = None
with open(input_path_2, 'rU') as input2:
    list2 = [x for x in ColumnExtractor(input2, dialect2)]

extract_result = (
    list(
    sorted(
        (
            {
                'id': (a if len(a) < len(b) else b),
                'description': '{}/{}'.format(a, b)
            }
            for (a, b) in zip(list1, list2)
        ),

        key=(lambda x: x['id'])
    ))
)
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

