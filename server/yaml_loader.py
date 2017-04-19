import yaml
import os.path
from re import compile, MULTILINE

RE_INCLUDE = compile(r"""^\s*@include\<([^\<\>]+)\>\s*$""", MULTILINE)

def preprocess(value, path):
    try:
        match = RE_INCLUDE.search(value)
    except TypeError:
        return value
    else:
        while match is not None:
            rel_path = match.group(1)
            file_path = os.path.join(path, rel_path)
            local_dirname = os.path.dirname(file_path)
            span = match.span()
            with open(file_path) as f:
                value = ''.join(filter(None, (
                        value[:span[0]],
                        preprocess(f.read(), local_dirname),
                        value[span[1]:])))

            match = RE_INCLUDE.search(value)

    return value

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

    return preprocess(value, os.path.dirname(path))


def load(path):
    return post_process(yaml.load(open(path)), path)
