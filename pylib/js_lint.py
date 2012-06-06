import glob
import os
import re

REQUIRES_BLOCK_PATTERN = re.compile(
  r'(var\s+[A-Za-z0-9]+\s*=\s*require\(\'[a-zA-Z0-9/]+\'\)\.[a-zA-Z0-9]+\s*;\s*)+'
)

# Fix requires('....') order.
def js_lint_dir(dir_path) :
  for rootdir, dirnames, filenames in os.walk(dir_path, True, None, True) :
    if (rootdir.find('google_app_engine_host') > -1 or
        rootdir.find('.git') > -1 or
        rootdir.find('pylib') > -1 or
        rootdir.find('explorer_pkg') > -1 or
        rootdir.find('.idea') > -1) :
      continue

    for filename in filenames :
      if filename.endswith('.js') :
        path = os.path.join(rootdir, filename)
        js_lint_file(path)

# Fix requires('....') order.
def js_lint_file(path) :
  source = _get_file(path)

  matches = REQUIRES_BLOCK_PATTERN.finditer(source)
  for match in matches :
    expression = match.group()
    new_expression = sort_content(expression, path)

    if expression != new_expression :
      print '*' * 80
      print path
      print '\nReplace: \n%s\nwith:\n%s' % (expression, new_expression)
      js_file = open(path, 'w')
      source = source.replace(expression, new_expression)
      js_file.write(source)
      js_file.close()

def sort_content(content, path) :
  lines = []

  for line in content.strip().splitlines() :
    line = line.strip()

    if not line :
      continue

    if not line.startswith('var ') :
      raise Exception(
        'Unable to sort line %s from %s \n\n %s' %
        (line, path, content))
    lines.append(line)

  lines.sort()
  return '\n'.join(lines) + '\n\n'


def _get_file(abs_path) :
  f = open(abs_path)
  content = f.read()
  f.close()
  return str(content)

if __name__ == '__main__' :
  js_lint_dir('.')


