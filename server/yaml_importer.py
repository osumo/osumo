
import imp
import json
import sys
import yaml

import os.path

from re import compile
from types import ModuleType

from collections import MutableMapping

RE_INCLUDE = compile(r"""^@include\(([^\(\)]+)\)""")

class YamlImporter(object):
    def merge(self, value, object=None):
        is_dict = True
        is_array = False
        try:
            generator = value.iteritems()
        except AttributeError:
            is_dict = False
            is_array = not isinstance(value, basestring)
            if is_array:
                try:
                    generator = (self.merge(x) for x in value)
                except TypeError:
                    is_array = False

        if is_dict:
            if object is None: object={}

            for k, v in generator:
                object[k] = self.merge(v)
            return object

        if is_array:
            return list(generator)

        try:
            match = RE_INCLUDE.match(value)
        except TypeError:
            pass
        else:
            if match is not None:
                rel_path = match.group(1)
                file_path = os.path.join(os.path.dirname(self.path), rel_path)
                value = open(file_path).read()

        return value

    def find_module(self, fullname, path=None):
        mid_path = fullname.split(".")[3:]
        if not mid_path:
            return None

        mid_path = os.path.join(*mid_path)
        for basepath in ([path]
                         if isinstance(path, basestring)
                         else path or ["."]):
            for candidate, is_package in (
                (os.path.join(basepath, mid_path, "__init__.yml"), True),
                (os.path.join(basepath, mid_path) + ".yml"       , False),
                (os.path.join(os.path.dirname(basepath),
                              mid_path,
                              "__init__.yml"), True),
                (os.path.join(os.path.dirname(basepath),
                              mid_path) + ".yml", False)
            ):
                if os.path.isfile(candidate):
                    self.path = candidate
                    self.is_package = is_package
                    return self

        return None

    def load_module(self, name):
        if name in sys.modules:
            return sys.modules[name]
        data = yaml.load(open(self.path))

        result = ModuleType(name)
        result.__dict__["__file__"] = self.path
        if self.is_package:
            result.__dict__["__path__"] = os.path.dirname(self.path)
        result.__dict__["doc"] = self.merge(data)
        sys.modules[name] = result
        return result

sys.meta_path.append(YamlImporter())

__all__ = []

