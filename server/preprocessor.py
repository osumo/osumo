"""Simple C-like text preprocessor.

For now, only supports a very small subset of preprocessor operations:

    # def(ine)<ABC>      adds "ABC" to the current set of defined symbols

    # undef(ine)<ABC>    removes "ABC" from the current set of defined symbols

    # ifdef(ined)<ABC>   skip subsequent lines up to a matching "endif"
                         operation -- unless "ABC" is in the current set of
                         defined symbols.

    # ifndef(ined)<ABC>  skip subsequent lines up to a matching "endif"
                         operation -- but only if "ABC" is in the current set of
                         defined symbols.

    # include<ABC>       includes the contents of the file referenced by the
                         path "ABC" (relative to the path of the current file).
                         Sets the current file to "ABC".
"""

import os
import os.path
from re import compile
from six import string_types

try:
    from cStringIO import StringIO
except ImportError:
    from io import StringIO

RE_INCLUDE = compile(r"""^\s*#\s*include\<([^\<\>]+)\>\s*$""")
RE_DEFINE = compile(r"""^\s*#\s*def(ine)?\<([^\<\>]+)\>\s*$""")
RE_UNDEFINE = compile(r"""^\s*#\s*undef(ine)?\<([^\<\>]+)\>\s*$""")
RE_IFDEF = compile(r"""^\s*#\s*ifdef(ined)?\<([^\<\>]+)\>\s*$""")
RE_IFNDEF = compile(r"""^\s*#\s*ifndef(ined)?\<([^\<\>]+)\>\s*$""")
RE_ENDIF = compile(r"""^\s*#\s*endif\s*$""")


def preprocess_branch_helper(f_in, local_dir, defines, target, ignoring):
    """Preprocessing branch helper function."""
    if_counter = 1

    if not ignoring:
        cache = StringIO()

    for line in f_in:
        if RE_IFDEF.match(line) or RE_IFNDEF.match(line):
            if_counter += 1

        if RE_ENDIF.match(line):
            if_counter -= 1
            if if_counter == 0:
                if not ignoring:
                    cache.seek(0)
                break

        if not ignoring:
            cache.write(line)
            cache.write('\n')

    if not ignoring:
        preprocess_helper(cache, local_dir, defines, target)


def preprocess_helper(f_in, local_dir, defines, target):
    """Preprocessing helper function."""
    for line in f_in:
        if line[-1:] == '\n':
            line = line[:-1]

        # handle includes
        match = RE_INCLUDE.match(line)
        if match:
            rel_path = match.group(1)
            file_path = os.path.join(local_dir, rel_path)
            local_dirname = os.path.dirname(file_path)
            with open(file_path) as f:
                preprocess_helper(f, local_dirname, defines, target)
            continue

        # handle defines
        match = RE_DEFINE.match(line)
        if match:
            symbol = match.group(2)
            defines.add(symbol)
            continue

        # handle undefines
        match = RE_UNDEFINE.match(line)
        if match:
            symbol = match.group(2)
            defines.remove(symbol)
            continue

        # handle branches
        ignore_lines = False
        handle_branch = False

        # This while loop is just a (sub) scope that is always broken out of.
        # It's used to manage control flow without having to write another
        # function.
        while True:
            match = RE_IFDEF.match(line)
            if match:
                handle_branch = True
                symbol = match.group(2)
                ignore_lines = symbol not in defines
                break

            match = RE_IFNDEF.match(line)
            if match:
                handle_branch = True
                symbol = match.group(2)
                ignore_lines = symbol in defines
                break

            break

        # Both types of branches are handled here
        if handle_branch:
            preprocess_branch_helper(
                f_in, local_dir, defines, target, ignore_lines)
            continue

        # If nothing matches, assume that this is a regular line of text.
        # Reproduce the line as-is.
        target.write(line)
        target.write('\n')

    return target


def preprocess(f_in, filepath=None, defines=None):
    """Preprocess a file-like object."""
    if isinstance(f_in, string_types):
        f_in = StringIO(f_in)

    if filepath is None:
        local_dir = os.getcwd()
    else:
        local_dir = os.path.dirname(filepath)

    if defines is None:
        defines = set()

    target = StringIO()

    return preprocess_helper(f_in, local_dir, defines, target).getvalue()[:-1]
