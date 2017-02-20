import yaml
import os.path
from re import compile

RE_INCLUDE = compile(r"""^@include\(([^\(\)]+)\)""")

def post_process(value, path):
    is_dict = True
    is_array = False
    try:
        generator = value.iteritems()
    except AttributeError:
        is_dict = False
        is_array = not isinstance(value, basestring)
        if is_array:
            try:
                generator = ( post_process(x, path) for x in value )
            except TypeError:
                is_array = False

    if is_dict:
        return { k: post_process(v, path) for k, v in generator }

    if is_array:
        return list(generator)

    try:
        match = RE_INCLUDE.match(value)
    except TypeError:
        pass
    else:
        if match is not None:
            rel_path = match.group(1)
            file_path = os.path.join(os.path.dirname(path), rel_path)
            value = open(file_path).read()

    return value


def load(path):
    return post_process(yaml.load(open(path)), path)
