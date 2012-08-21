import glob
import os
import re


def css_lint_dir(dir_path) :
  for rootdir, dirnames, filenames in os.walk(dir_path, True, None, True) :
    if (rootdir.find('google_app_engine_host') > -1 or
        rootdir.find('.git') > -1 or
        rootdir.find('pylib') > -1 or
        rootdir.find('explorer_pkg') > -1 or
        rootdir.find('.idea') > -1) :
      continue

    for filename in filenames :
      if filename.endswith('.css') :
        path = os.path.join(rootdir, filename)
        css_lint_file(path)

CSS_BLOCK_CONTENT_PATTERN = re.compile(r'{[^}]+}')

def css_lint_file(file_path) :
  source = _get_file(file_path)
  new_source = source
  matches = CSS_BLOCK_CONTENT_PATTERN.finditer(source)

  for match in matches :
    old_content = match.group()
    new_content = old_content[1 :len(old_content) - 1]
    new_content = sort_content(new_content, file_path)
    if new_content != old_content :
      new_source = new_source.replace(old_content, new_content)

  if new_source != source :
    css_file = open(file_path, 'w')
    css_file.write(new_source)
    css_file.close()
    print 'CSS Lint >> ' + file_path


def sort_content(content, path) :
  lines = []

  for line in content.splitlines() :
    line = line.strip()
    if ((line.find('/*') > -1 and line.find('*/') == -1) or
        (line.find('*/') > -1 and line.find('/*') == -1)) :
      raise Exception(
        'Unable to sort content with multline CSS comments \n%s\n\n%s\n\n%s' %
        (path, line, content))
    lines.append('  ' + line)

  lines.sort()
  return '{' + '\n'.join(lines) + '\n}'


def _get_file(abs_path) :
  f = open(abs_path)
  content = f.read()
  f.close()
  return str(content)

if __name__ == '__main__' :
  css_lint_dir('.')
