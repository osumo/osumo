
SNIFFER_SIZE = 1024
SNIFFER_NUM_LINES = 3
SNIFFER_DELIMITERS = ',;\t\n|'

class ColumnExtractor(object):
    def __init__(self, file, dialect):
        from csv import reader

        self.file = file
        self.dialect = dialect
        self.reader = reader(file, dialect)
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


class RowExtractor(object):
    def __init__(self, file, dialect):
        self.file = file
        self.dialect = dialect

    def next(self):
        read_until(self.file, '\n')
        field = read_until(self.file, self.dialect.delimiter)
        if not field:
            raise StopIteration

        if (
                field[0] == field[-1] and
                field[0] == self.dialect.quotechar and
                self.dialect.quoting):
            field = field[1:-1]

        return field

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

        result += f.read(1)

    return result


def get_dialect(input_path):
    from csv import Sniffer

    dialect = None
    with open(input_path, 'rU') as input:
        dialect = Sniffer().sniff(
            read_until(input, '\n', SNIFFER_NUM_LINES),
            delimiters=SNIFFER_DELIMITERS)
    return dialect

def make_float(x):
    from numpy import nan

    try:
        return float(x)
    except ValueError:
        return nan

def read_csv(input_path, dialect):
    from csv import reader
    from numpy import array, float64

    row_headers, column_headers, data_block = None, None, None
    with open(input_path, 'rU') as f:
        reader = reader(f, dialect=dialect)
        column_headers = list(next(reader))[1:]
        row_headers, data_block = zip(
            *(
                [row[0], row[1:]]
                for row in (
                    list(list(row2) for row2 in reader)
                )
            )
        )

        row_headers = array(list(row_headers))
        column_headers = array(list(column_headers))
        data_block = array(
            [
                [make_float(scalar) for scalar in row]
                for row in data_block
            ],
            dtype=float64
        )

    return data_block, row_headers, column_headers

def write_csv_helper(data_block, row_headers, column_headers, f, dialect):
    from csv import writer

    writer = writer(f, dialect=dialect)
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

