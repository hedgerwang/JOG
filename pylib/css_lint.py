import glob
import os
import re


def css_lint_dir(dir_path) :
  paths = glob.glob(dir_path)
  for path in paths :
    if os.path.isdir(path) :
      css_lint_dir(path + '/*')
    elif os.path.isfile(path) :
      if path.endswith('css') :
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
  dir_names = [
    'app',
    'jog'
  ]
  for dir_name in dir_names :
    css_lint_dir(dir_name)
