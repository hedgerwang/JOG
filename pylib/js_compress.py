import jsrequire
import os
import re

CLOSURE_COMPRESSOR_PATH = 'pylib/external/jsc/compiler.jar'
CLOSURE_FLAGS = [
  #'--formatting PRETTY_PRINT',
  '--compilation_level SIMPLE_OPTIMIZATIONS',
  ]

DEV_MODE = False
VAR_DEBUG_PATTERN = re.compile(r'var\s+__DEV__\s*=\s*[a-z]+\s*;')
CONSOLE_PATTERN = re.compile(r'[\s;\}\{]console\.(log|warn|error)\(')


def compress(path, cssx_map=None) :
  print 'Compress JS file'

  if not os.path.isfile(CLOSURE_COMPRESSOR_PATH) :
    raise 'Error: %s does not exist' % CLOSURE_COMPRESSOR_PATH

  path = path.strip()

  if not os.path.isfile(path) :
    raise 'Error: %s does not exist' % path

  build_dir_path = 'pylib/.js_compress_build'
  input_file_path = build_dir_path + '/' + path.replace('/', '_') + '.in.js'
  output_file_path = build_dir_path + '/' + path.replace('/', '_') + '.out.js'

  if not os.path.isdir(build_dir_path) :
    print 'Build directory does not exist, create one \n%s' % build_dir_path
    os.makedirs(build_dir_path)

  source = jsrequire.get(path, 'all')

  matches = jsrequire.RE_REQUIRE.finditer(source)
  new_module_names = {}
  next_module_id = 0

  for match in matches :
    module_name = match.group('path')
    if not module_name in new_module_names :
      new_module_names[module_name] = 'm' + str(next_module_id)
      next_module_id += 1
    expression = match.group()
    new_expression = expression.replace(
      "require('%s')" % module_name,
      "require('%s')" % new_module_names[module_name])
    print 'Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

    expression = "define('%s'" % module_name
    new_expression = "define('%s'" % new_module_names[module_name]
    print 'Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

  if cssx_map is not None :
    for key in cssx_map :
      expression = 'cssx(\'%s\')' % key
      new_expression = "'%s'" % cssx_map[key]
      print 'Replace "%s" with "%s"' % (expression, new_expression)
      source = source.replace(expression, new_expression)

  matches = VAR_DEBUG_PATTERN.finditer(source)

  for match in matches :
    expression = match.group()
    new_expression = 'var __DEV__ = %s;' % str(DEV_MODE).lower()
    print '>> Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

  matches = CONSOLE_PATTERN.finditer(source)
  for match in matches :
    expression = match.group()
    prefix = expression[0 : expression.find('console.')]
    suffix = expression[expression.find('console.') :]
    new_expression = prefix + '__DEV__ && ' + suffix
    print '>> Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

  # Use closure so that __DEV__ can be removed safely.
  source = '(function(window, document){\n%s\n})(window, document)' % source

  js_file = open(input_file_path, 'w')
  js_file.write(source)
  js_file.close()

  cmd = ("""
  java
  -jar %(jar_path)s
  %(flags)s
  --js %(input)s
  --js_output_file %(output)s
  """ % {
    'jar_path' : CLOSURE_COMPRESSOR_PATH,
    'input' : input_file_path,
    'output' : output_file_path,
    'flags' : ' '.join([flag for flag in CLOSURE_FLAGS])
  }).replace('\n', ' ')

  os.system(cmd)

  js_file = open(output_file_path)
  source = js_file.read()
  js_file.close()
  return source


if __name__ == '__main__' :
  compress('app/app.js')
