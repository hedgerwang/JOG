import css_compress
import js_compress
import json
import gen_xmap
import os

HTML_TEMPLATE = """
<!doctype html>
<html manifest="/cache.manifest">
<head>
<title>app</title>
<meta charset="UTF-8" />
<meta name="viewport"
  content="width=device-width, initial-scale=%(dpr)s, maximum-scale=%(dpr)s
           user-scalable=no, target-densitydpi=%(densitydpi)s"/>
<style>
%(css)s
</style>
</head>
<body>


<script>
%(js)s
</script>
</body>
</html>
""".replace('\n', '')

def build_app(html_out_path, js_in_path, css_in_path, scale) :
  scale = float(scale)

  cssx_map = gen_xmap.gen_cssx_map('.')
  js_code = js_compress.compress(js_in_path, cssx_map)
  css_code = css_compress.compress(css_in_path, scale, cssx_map)

  densitydpi = int(160 * scale)

  html_code = HTML_TEMPLATE % {
    'dpr' : str(1 / scale),
    'css' : css_code,
    'js' : js_code,
    'densitydpi' : densitydpi
  }
  html_file = open('google_app_engine_host/build/' + html_out_path, 'w')
  html_file.write(html_code)
  html_file.close()
  print 'Build APP Done'

if __name__ == '__main__' :
  build_app('2x.html', 'app/app.js', 'app/app.css', 2)
  build_app('1x.html', 'app/app.js', 'app/app.css', 1)
  # build_app('0x.html', 'app/app.js', 'app/app.css', 0.5)
