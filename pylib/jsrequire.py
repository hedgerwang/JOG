import re
from os import curdir, sep
import os

RE_REQUIRE = re.compile(
  r'[=\s]require\(\'(?P<path>[a-zA-Z0-9\/\.]+)\'\)[;\s\.]?')

MODULE_WRAP = """
define('%s',
function(){
var exports = {};
%s;
return exports;
});

""" + '/' + ('*' * 78) + '/'

CORE_JS_PATH = 'jog/requires/requires.js'

def get(path) :
  deps = get_deps(path)
  contents = []
  for js_path in deps :
    if js_path == CORE_JS_PATH :
      contents.append(_get_file(js_path))
    else :
      module_name = _normalize_module_name(js_path)
      module_text = MODULE_WRAP % (module_name, _get_file(js_path))
      contents.append('/* %s */' % js_path)
      contents.append(module_text)
  return '\n\n'.join(contents)


def get_deps(path, _required=None, _include_core=True) :
  if _required is None :
    _required = {}

  path = _normalize_file_path(path)

  if _required.get(path) :
    # Already required.
    return []
  else :
    # Mark as required.
    _required[path] = True

  content = _get_file(path)
  deps = []

  for match in RE_REQUIRE.finditer(content) :
    more_deps = get_deps(match.group('path'), _required, False)
    for more_dep in more_deps :
      deps.append(more_dep)

  if _include_core :
    deps.insert(0, CORE_JS_PATH)

  deps.append(path)
  return deps


def _normalize_module_name(path) :
  path = (curdir + sep + path).strip()
  path = path.replace('//', '/')

  if path.startswith('./') :
    path = path.replace('./', '')

  if path.endswith('.js') :
    idx = path.rfind('/')
    path = path[0 :idx]

  return path


def _normalize_file_path(path) :
  path = (curdir + sep + path).strip()
  path = path.replace('//', '/')

  if path.startswith('./') :
    path = path.replace('./', '')

  if path.endswith('/') :
    path = path[0 :len(path) - 2]

  if path.find('.js') < 0 :
    idx = path.rfind('/')
    if idx > -1 :
      module_name = path[idx + 1 :]
      temp_path = path + '/' + module_name + '.js'
      if os.path.isfile(temp_path) :
        path = temp_path
      else :
        raise 'Module %s not found' % temp_path
    else :
      raise 'Unable to normalize path %s' % path
  return path


def _get_file(abs_path) :
  f = open(abs_path)
  content = f.read()
  f.close()
  return str(content)


def main() :
  pass

if __name__ == '__main__' :
  main()

