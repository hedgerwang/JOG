import cssrequire
import os
import re

YUI_COMPRESSOR_PATH = 'pylib/external/yuicompressor/yuicompressor-2.4.6.jar'

def compress(path, scale, cssx_map=None) :
  print 'Compress CSS file'

  if not os.path.isfile(YUI_COMPRESSOR_PATH) :
    raise 'Error: %s does not exist' % YUI_COMPRESSOR_PATH

  path = path.strip()

  if not os.path.isfile(path) :
    raise 'Error: %s does not exist' % path

  build_dir_path = 'pylib/.css_compress_build'
  input_file_path = build_dir_path + '/' + path.replace('/', '_') + '.in.css'
  output_file_path = build_dir_path + '/' + path.replace('/', '_') + '.out.css'

  if not os.path.isdir(build_dir_path) :
    print 'Build directory does not exist, create one \n%s' % build_dir_path
    os.makedirs(build_dir_path)

  source = cssrequire.get(path, 'all')
  source = cssrequire.translate(source, scale)

  if cssx_map is not None :
    for key in cssx_map :
      pattern = re.compile(r'\.%s[\s\.\{:]' % key)
      matches = pattern.finditer(source)
      for match  in matches :
        selector = match.group()
        new_selector = selector.replace('.' + key, '.' + cssx_map[key])
        print 'Replace "%s" with "%s"' % (selector, new_selector)
        source = source.replace(selector, new_selector)

  css_file = open(input_file_path, 'w')
  css_file.write(source)
  css_file.close()

  cmd = 'java -jar %(jar_path)s --type css -o %(output)s %(input)s' % {
    'jar_path' : YUI_COMPRESSOR_PATH,
    'input' : input_file_path,
    'output' : output_file_path
  }

  os.system(cmd)

  css_file = open(output_file_path)
  source = css_file.read()
  css_file.close()
  return source


if __name__ == '__main__' :
  print compress('app/app.css', 2)
