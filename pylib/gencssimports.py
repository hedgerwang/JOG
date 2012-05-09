import glob
import sys
import os


def genCSS(target) :
  if not os.path.isfile(target) :
    raise Exception('%s is not file' % target)
  if not target.endswith('.js') :
    raise Exception('%s is not a JS file' % target)
  js_text = _get_file(target)
  print js_text

def _get_file(abs_path) :
  f = open(abs_path)
  content = f.read()
  f.close()
  return str(content)

def main() :
  i = 0
  for arg in sys.argv :
    if i > 0 :
      genCSS(arg)
    i += 1

  if i <= 1 :
    raise Exception('no target JS file specified')


if __name__ == '__main__' :
  main()