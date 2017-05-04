"""YAML loading and processing functions."""

import yaml
from six import string_types

from .preprocessor import preprocess


def post_process(value, path):
    """Process a parsed YAML document."""
    is_dict = True
    is_array = False
    try:
        generator = value.iteritems()
    except AttributeError:
        is_dict = False
        is_array = not isinstance(value, string_types)
        if is_array:
            try:
                generator = (post_process(x, path) for x in value)
            except TypeError:
                is_array = False

    if is_dict:
        return {k: post_process(v, path) for k, v in generator}

    if is_array:
        return list(generator)

    try:
        value = preprocess(value, path)
    except TypeError:
        pass

    return value


def load(path):
    """Load and process a YAML file."""
    return post_process(yaml.load(open(path)), path)
