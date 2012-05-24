import re
import jsrequire
import os
from os import curdir, sep

MODULE_WRAP = """
%s
%s

/* import %s */

%s

""" + '/' + ('*' * 78) + '/'

def get(path, mode=None) :
  path = _normalize_file_path(path)
  deps = get_deps(path)
  css = []

  if mode == 'all' :
    for css_path in deps :
      css.append('/* %s */' % css_path)
      css.append(_get_file(css_path))
  elif mode == 'debug' :
    template = '@import url(/%s);'
    for css_path in deps :
      css.append(template % css_path)
  else :
    if os.path.isfile(path) :
      css.append(_get_file(path))
    else :
      css.append('/* NOT FOUND: %s */' % path)


  return '\n\n'.join(css)


def get_deps(path) :
  path = _normalize_file_path(path)
  deps = []
  js_path = path.replace('.css', '.js')
  required = {}

  print '-' * 80
  print js_path

  if os.path.isfile(js_path) :
    more_js_deps = jsrequire.get_deps(js_path)
    for more_js_file in more_js_deps :
      more_css_path = more_js_file.replace('.js', '.css')
      if os.path.isfile(more_css_path) :
        if not required.get(more_css_path) :
          required[more_css_path] = True
          deps.append(more_css_path)

  if not required.get(path) and os.path.isfile(path) :
    deps.append(path)

  return deps


def _get_module(abs_path) :
  if not abs_path.endswith('.css') :
    module_name = abs_path[abs_path.rfind('/') :]
    abs_path = abs_path + module_name + '.css'
  return _get_file(abs_path)


def _normalize_file_path(path) :
  path = (curdir + sep + path).strip()
  path = path.replace('//', '/')

  if path.startswith('./') :
    path = path.replace('./', '')

  if path.endswith('/') :
    path = path[0 :len(path) - 2]

  if path.find('.css') < 0 :
    idx = path.rfind('/')
    if idx > -1 :
      module_name = path[idx + 1 :]
      temp_path = path + '/' + module_name + '.css'
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

