import cssrequire
import os

YUI_COMPRESSOR_PATH = 'pylib/external/yuicompressor/yuicompressor-2.4.6.jar'

def compress(path, scale) :
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
