import os
import re
import sys
import glob

html_template = '''
<!doctype html>
<html>
<head>
<title>Test %s</title>
<!-- http://localhost:8888/%s -->
%s
</head>
<body>
<script src="/%s?mode=all"></script>
</body>
</html>
'''

js_template = '''
/**
 * @fileOverview %s Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/%s
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('%s Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });
'''

js_module_name_pattern = re.compile(
  r'\s*exports\.[a-zA-Z0-9]+\s*=\s*(?P<path>[A-Za-z0-9]+)')

def get_js_module_name(path) :
  f = open(path)
  content = f.read()
  f.close()

  for match in js_module_name_pattern.finditer(content) :
    return match.group('path')

  return path


def gen_js_test(dir_path) :
  paths = glob.glob(dir_path)
  for path in paths :
    if os.path.isdir(path) :
      gen_js_test(path + '/*')
    elif os.path.isfile(path) :
      if (path.endswith('_test_test.html') or
          path.endswith('_test_test.html') or
          path.endswith('_html.js') or
          path.endswith('_html_test.html')) :
        raise Exception('Bad file %s' % path)
        # os.system('rm %s' % path)
        # continue

      if not path.endswith('.js') or path.endswith('_test.js') :
        continue

      js_file_name = path[path.rfind('/') + 1 :]

      if (js_file_name == 'core.js' or
          js_file_name == 'asserts.js') :
        print '>>> skip >>> %s' % path
        continue

      css_test_file_path = path[0 :path.rfind('.js')] + '_test.css'

      if not os.path.isfile(css_test_file_path) :
        css_test_file = open(css_test_file_path, 'w')
        css_test_file.write('/* test */')
        css_test_file.close()

      stylesheet_html = (
        """
        <link type="text/css" rel="stylesheet" href="/%s?mode=all"/>""" %
        css_test_file_path
        ).strip()

      css_demo_file_path = path[0 :path.rfind('.js')] + '_demo.css'
      if os.path.isfile(css_demo_file_path) :
        raise Exception(css_demo_file_path)
        stylesheet_html = (
          """
          %s \n<link type="text/css" rel="stylesheet"
                href="/%s"/>""" %
          (stylesheet_html, css_demo_file_path)
          ).strip()

      js_test_file_path = path[0 :path.rfind('.js')] + '_test.js'
      html_test_file_path = path[0 :path.rfind('.js')] + '_test.html'

      module_name = get_js_module_name(path)

      if True or not os.path.exists(html_test_file_path) :
        html = html_template % (
          module_name,
          html_test_file_path,
          stylesheet_html,
          js_test_file_path
          )
        html_file = open(html_test_file_path, 'w')
        html_file.write(html.strip())
        html_file.close()
        print 'gen >> ' + html_test_file_path

      if not os.path.exists(js_test_file_path) :
        js = js_template % (module_name, html_test_file_path, module_name)
        js_file = open(js_test_file_path, 'w')
        js_file.write(js.strip())
        js_file.close()
        print 'gen >> ' + js_test_file_path

if __name__ == '__main__' :
  dir_names = [
    'app',
    'jog'
  ]
  for dir_name in dir_names :
    gen_js_test(dir_name)


