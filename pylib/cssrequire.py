import re
from os import curdir, sep

RE_REQUIRE = re.compile(
  r'\s*@import\surl\(\'(?P<path>[a-zA-Z0-9\/\.]+)\'\)[;\s\.]?')

MODULE_WRAP = """
%s
%s

/* import %s */

%s;

""" + '/' + ('*' * 78) + '/'

def get(path, required=None, include_requires=False) :
  if required is None :
    required = {}

  abs_path = curdir + sep + path

  if required.get(abs_path) :
    # Already required.
    return ''
  else :
    # Mark as required.
    required[abs_path] = True

  content = _get_module(abs_path)
  all_before_content = []
  for match in RE_REQUIRE.finditer(content) :
    all_before_content.append(get(match.group('path'), required))
    content = content.replace(match.string, '/* %s */' % match.string)

  core_content = ''
  if include_requires :
    core_content = _get_module(curdir + sep + 'jog/ui/baseui/baseui.css')

  out = (MODULE_WRAP % (core_content,
                        ''.join(all_before_content),
                        path,
                        content))
  out = out.strip() # .replace(RE_REQUIRE, '')
  return out

def _get_module(abs_path) :
  if not abs_path.endswith('.css') :
    module_name = abs_path[abs_path.rfind('/') :]
    abs_path = abs_path + module_name + '.css'
  return _get_file(abs_path)


def _get_file(abs_path) :
  f = open(abs_path)
  content = f.read()
  f.close()
  return str(content)


def main() :
  pass

if __name__ == '__main__' :
  main()

