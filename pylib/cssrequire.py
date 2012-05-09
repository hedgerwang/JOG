import re
from os import curdir, sep

MODULE_WRAP = """
%s
%s

/* import %s */

%s

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

  prefix = "@import url('"
  suffix = "');"

  while True :
    start = content.find(prefix)
    if start < 0 :
      break
    else :
      content_before = content[0 :start]
      content_after = content[start :]
      end = content_after.find(suffix)
      if suffix < 0 :
        raise 'Inlaid @import url syntax'
      else :
        end = end + len(suffix)
        content_after = content_after[end :].strip()
        import_url = content[start :end].strip()
        import_url = import_url[len(prefix) :import_url.find(suffix)]
        if import_url :
          all_before_content.append(get(import_url, required))
        content = content_before + content_after

  core_content = ''
  if include_requires :
    pass
    # core_content = _get_module(curdir + sep + 'jog/ui/baseui/baseui.css')

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

