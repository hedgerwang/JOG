import jsrequire
import os
import re

CLOSURE_COMPRESSOR_PATH = 'pylib/external/jsc/compiler.jar'
CLOSURE_FLAGS = [
  #'--formatting PRETTY_PRINT',
  '--compilation_level SIMPLE_OPTIMIZATIONS',
  ]

DEV_MODE = False

# var __DEV__ = ....
VAR_DEBUG_PATTERN = re.compile(r'var\s+__DEV__\s*=\s*[a-z]+\s*;')

# console.log(...);
CONSOLE_PATTERN = re.compile(r'[\s;\}\{]console\.(log|warn|error)\(.+\)\s*;')

# this._fooBar
PRIVATE_MEMBER_PATTERN = re.compile(
  r'[\s;\{\.](?P<name>(_[a-zA-Z0-9]+)+)[><\?:|&\-\+\[\]\.\(\);\s=,\{\}]')


# PROPERTY_FOO_BAR
ENUM_PATTERN = re.compile(
  r'[\s;\{\.\[\{:](?P<name>([A-Z]+(_[A-Z]+)+))')

# [><\?:|&\-\+\[\]\.\(\);\s=,\{\}]


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

  # Dangerous. (it may rename browser built-in constants or enums).
  # Crush constants or enum.
  matches = ENUM_PATTERN.finditer(source)
  new_constant_names = {}
  next_const_name_id = 0
  for match in matches :
    constant_name = match.group('name')

    if not constant_name in new_constant_names :
      next_const_name_id += 1
      new_constant_names[constant_name] = '$_' + hex(next_const_name_id)[2 :]

    expression = match.group()
    new_expression = expression.replace(constant_name,
                                        new_constant_names[constant_name])
    print 'Replace %s with %s' % (expression, new_expression)
    source = source.replace(expression, new_expression)


  # Crush require('module/name').
  matches = jsrequire.RE_REQUIRE.finditer(source)
  new_constant_names = {}

  # TODO(hedger): should module id use timestamp?
  next_module_id = 0

  for match in matches :
    module_name = match.group('path')
    if not module_name in new_constant_names :
      new_constant_names[module_name] = 'm' + hex(next_module_id)[2 :]
      next_module_id += 1
    expression = match.group()
    new_expression = expression.replace(
      "require('%s')" % module_name,
      "require('%s')" % new_constant_names[module_name])
    print 'Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

    expression = "define('%s'" % module_name
    new_expression = "define('%s'" % new_constant_names[module_name]
    print 'Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

  # Crush css('css-selector-name').
  if cssx_map is not None :
    for key in cssx_map :
      expression = 'cssx(\'%s\')' % key
      new_expression = "'%s'" % cssx_map[key]
      print 'Replace "%s" with "%s"' % (expression, new_expression)
      source = source.replace(expression, new_expression)

  # Crush __DEV__
  matches = VAR_DEBUG_PATTERN.finditer(source)

  for match in matches :
    expression = match.group()
    new_expression = 'var __DEV__ = %s;' % str(DEV_MODE).lower()
    print '>> Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

  # Crush console.log()
  matches = CONSOLE_PATTERN.finditer(source)
  for match in matches :
    expression = match.group()
    print '>> Remove "%s"' % expression
    source = source.replace(expression, '')

  # Crush _privateMethod
  # This is very dangerous!!!
  next_member_id = 0
  new_member_names = {}
  matches = PRIVATE_MEMBER_PATTERN.finditer(source)
  for match in matches :
    expression = match.group()
    member_name = match.group('name')

    if not (member_name in new_member_names) :
      new_member_names[member_name] = '$p' + hex(next_member_id)[2 :]
      next_member_id += 1

    new_expression = expression.replace(member_name,
                                        new_member_names[member_name])

    print '>> Replace "%s" with "%s"' % (expression, new_expression)
    source = source.replace(expression, new_expression)

  # Use closure so that __DEV__ can be removed safely by the compiler.
  source = '''(function(window, document){
  // Make console.* do nothing so that compiler can strip them.
  var console = {};
  console.log = function(){};
  console.error = function(){};
  console.info = function(){};

  \n%s\n
  })(window, document)
  ''' % source

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

  idx = source.find('console.')
  if idx > -1 :
    raise Exception('''
    It appears that console.log() did not get removed properly.
    Can you fix it?
    %s
    ''' % source[idx - 200 : idx + 200])

  print idx
  return source


if __name__ == '__main__' :
  compress('app/app.js')
