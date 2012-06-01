import re
import jsrequire
import os
from os import curdir, sep
import useragent


CSS_TRANSLATE_PROPERTIES = [
  'margin',
  'margin-[a-z]+',
  'padding',
  'padding-[a-z]+',
  'width',
  'height',
  'left',
  'top',
  'right',
  'bottom',
  'text-indent',
  'font-size',
  'font',
  'line-height',
  'background',
  'background-size',
  'background-position',
  'border-radius',
  ]

CSS_VENDER_PROPERTIES = [
  'transform',
  'user-select',
  'box-shadow',
  'box-align',
  'box-orient',
  'box-pack',
  'hyphens',
  'mask-image',
  'tap-highlight-color',
  'text-size-adjust',
  ]

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


CSS_TRANSLATE_TEMPLATE = '''[\s;\{]%s\s*:[^;]+;'''

CSS_TRANSLATE_PROPERTIES_PATTERNS = [
re.compile(CSS_TRANSLATE_TEMPLATE % property)
for property in CSS_TRANSLATE_PROPERTIES
]

CSS_PX_PATTERN = re.compile(r'-?\d+px[/\s;]?')

CSS_NUMBER_PATTERN = re.compile(r'[/\s-]?\d+')

CSS_VENDER_PROPERTIES_PATTERNS = [
re.compile(CSS_TRANSLATE_TEMPLATE % property)
for property in CSS_VENDER_PROPERTIES
]


def translate(css_text, scale=1) :
  if scale != 1 :
    for re_pattern in CSS_TRANSLATE_PROPERTIES_PATTERNS :
      matches = re_pattern.finditer(css_text)
      for match in matches :
        old_rule = match.group()
        new_rule = _translate_px_rule(old_rule, scale)
        css_text = css_text.replace(old_rule, new_rule)

  for re_pattern in CSS_VENDER_PROPERTIES_PATTERNS :
    matches = re_pattern.finditer(css_text)

    for match in matches :
      old_rule = match.group()
      new_rule = _translate_vender_rule(old_rule)
      css_text = css_text.replace(old_rule, new_rule)

  return css_text


def _translate_vender_rule(rule) :
  prefix = ''
  if (rule.startswith('{')
      or rule.startswith(';')
      or rule.startswith(' ')) :
    prefix = rule[0 :1]
    rule = rule[1 :]
  rule = prefix + '-webkit-' + rule + ' /***/'
  return rule


def _translate_px_rule(rule, scale) :
  value = rule[rule.find(':') :]
  new_value = value

  px_values = CSS_PX_PATTERN.finditer(value)

  for px_value in px_values :
    px_value = px_value.group()
    new_px_value = px_value
    numbers = CSS_NUMBER_PATTERN.finditer(px_value)

    for num in numbers :
      old_num = num.group()
      new_num = int(old_num) * scale
      new_px_value = new_px_value.replace(old_num, str(int(new_num)))

    new_value = new_value.replace(px_value, new_px_value)

  new_rule = rule[0 :rule.find(':')] + new_value
  #  print '-' * 80
  #  print rule
  #  print new_rule

  return new_rule + ' /***/'


def get_deps(path) :
  path = _normalize_file_path(path)
  deps = []
  js_path = path.replace('.css', '.js')
  required = {}

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
  css_text = """

  .foo {
    transform: translate3d(0,0,0);
    user-select: none;
    margin: -1px -2px 3px 4px;
    margin: 110px 10px 0;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 10px  10px;
    padding-top: -10px;
    padding-left: -10px;
    padding-right: 10px;
    padding-bottom: 10px;
    left: 10px;
    top: 10px;
    right: 10px;
    bottom: 10px;
    width: 10px;
    height: 10px;
    text-indent: 10px;
    font-size: 10px;
    font: 13px/140% aria;
    font: 13px/12px aria;
    line-height: 12px;
    border-radius: 1px;
    background-size : 100% auto;
    background-size : 100px 100px;
    background-size : 123px 321px;
    background-position: -10px 10px;
    background: #fff url(/image/foo.jpg) 10px 10px no-repeat;
    box-shadow: 0 0 0 10px;
  }
  """

  print translate(css_text, 2)

if __name__ == '__main__' :
  main()

