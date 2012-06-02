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


def compress(path) :
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
  source = '(function(){\n%s\n})()' % source

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
  print compress('app/app.js')
