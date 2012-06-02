import glob
import os
import re
import json


CSSX_PATTERN = re.compile(
  r'[\+\|\&\?,:\s;\}\{]+cssx\([a-zA-Z0-9-_\']+\)[\+\|\&,:\s;\}\{]+')


def get_all_js_files(rootdir='.') :
  files = []
  for rootdir, dirnames, filenames in os.walk(rootdir) :
    for filename in filenames :
      if filename.endswith('_test.html') :
        if rootdir.find('google_app_engine_host') < 0 :
          path = os.path.join(rootdir, filename)
          files.append(path)
  sorted(files)
  return files


def process_file(path, map, next_id) :
  js_file = open(path, 'r')
  source = js_file.read()
  js_file.close()
  matches = CSSX_PATTERN.finditer(source)

  for match in matches :
    expression = match.group()
    token = expression[expression.find("'") + 1 :expression.rfind("'")]
    map[token] = 'a' + str(next_id)
    next_id += 1

  return next_id


def gen_cssx_map(dir_path) :
  map = {}
  next_id = 0

  for rootdir, dirnames, filenames in os.walk(dir_path) :
    for filename in filenames :
      if filename.endswith('.js') :
        if rootdir.find('google_app_engine_host') < 0 :
          path = os.path.join(rootdir, filename)
          next_id = process_file(path, map, next_id)

  text = json.dumps(map, indent=True)
  out_file = open('pylib/.gen/cssx.json', 'w')
  out_file.write(text)
  out_file.close()
  return text


if __name__ == '__main__' :
  print 'cssx'
  print gen_cssx_map('.')
