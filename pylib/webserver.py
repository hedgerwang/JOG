#!/usr/bin/env python
#Copyright Jon Berg , turtlemeat.com

import string, cgi, time
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
#import pri
import cssrequire
import jsrequire
import urlparse
import urllib2
import os
import glob
import fnmatch
import get_local_ip
import re
import useragent
import Cookie

httpHandler = urllib2.HTTPHandler(debuglevel=1)
httpsHandler = urllib2.HTTPSHandler(debuglevel=1)
opener = urllib2.build_opener(httpHandler, httpsHandler)
urllib2.install_opener(opener)

HTML_META = """
<script>window.__SCALE__ = '%s'</script>
<meta name="viewport"
      content="width=device-width, initial-scale=%s, maximum-scale=%s"/>
"""

def recursive_glob(rootdir='.') :
  files = []
  for rootdir, dirnames, filenames in os.walk(rootdir) :
    for filename in filenames :
      if filename.endswith('_test.html') :
        if rootdir.find('google_app_engine_host') < 0 :
          path = os.path.join(rootdir, filename)
          files.append(path)
  sorted(files)
  return files


def get_tests(rootdir='.') :
  return '\n'.join([
  '<li style="margin: 20px;"><a href="/%s">%s</a></li>' % (path, path)
  for path in recursive_glob(rootdir)
  ])


DEVICE_PIXEL_RATIO = 1

class WebHandler(BaseHTTPRequestHandler) :
  def do_GET(self) :
    try :
      global DEVICE_PIXEL_RATIO

      parsed_url = urlparse.urlparse(self.path)
      query_params = urlparse.parse_qs(parsed_url.query)

      dpr = query_params.get('dpr', None)

      if dpr is not None and dpr[0].isdigit() :
        DEVICE_PIXEL_RATIO = max(1, int(dpr[0]))

      print 'self.DEVICE_PIXEL_RATIO = %s' % DEVICE_PIXEL_RATIO

      self._scale = 1 / float(DEVICE_PIXEL_RATIO)

      path = parsed_url.path
      scheme = parsed_url.scheme.lower()
      mine = None
      type = self._get_path_type(parsed_url.path)

      if ((scheme == 'http' or scheme == 'https') and
          (parsed_url.netloc != 'gqlapp.appspot.com') and
          (parsed_url.netloc != 'localhost')) :
        raise Exception('Invalid request')
        # Use Proxy.
        # If the requested URL isn't from the domain that I can control,
        # this web server should have been used as a proxy server (e.g.
        # for iPhone browser testing).
        # url = parsed_url.geturl()
        # print '>> proxy %s' % url
        # req = urllib2.Request(url)
        # response = urllib2.urlopen(req)
        # content = response.read()
        # content = content.replace('https://', 'http://')
        # content = content.replace('<html', '----<xmp><html')
      else :
        # Will server local file
        if path.endswith('/') or type is None :
          # Default path.
          path = self._normalize_html_file_path(path)
          type = 'html'

        if path.endswith('tests') :
          mine = 'text/html'
          content = get_tests(rootdir='jog') + get_tests(rootdir='app')
        elif type == 'html' :
          path = self._normalize_html_file_path(path)
          mine = 'text/html'
          content = self._translate_html(self._get_file(path))
        elif type == 'ico' :
          mine = 'image/vnd.microsoft.icon'
          content = ''
        elif type == 'js' :
          mine = 'text/javascript'
          content = jsrequire.get(path, query_params.get('mode', [None])[0])
        elif  type == 'css' :
          mine = 'text/css'
          content = cssrequire.get(path, query_params.get('mode', [None])[0])
          if self._scale != 1 :
            content = cssrequire.translate(content, DEVICE_PIXEL_RATIO)
        elif type == 'png' :
          mine = 'image/png'
          content = self._get_file(path)
        elif type == 'jpg' :
          mine = 'image/jpg'
          content = self._get_file(path)
        else :
          mine = 'text/plain'
          content = 'Not supported "%s, %s"' % (type, path)

      self.send_response(200)

      if mine is not None and mine.find('image') > -1 :
        self.send_header('Cache-Control', 'max-age=864000')
        self.send_header('Expires', 'Fri, 30 Jan 2099 12:00:00 GMT')

      if mine is not None :
        self.send_header('Content-type', mine)

      self.end_headers()
      self.wfile.write(content)

    except IOError as inst :
      self.send_error(404, 'File Not Found: "%s"' % inst)

  def do_POST(self) :
    raise Exception('NO POST FOR NOW')
    #    global rootnode
    #
    #    parsed_url = urlparse.urlparse(self.path)
    #    scheme = parsed_url.scheme.lower()
    #
    #    if ((scheme == 'http' or scheme == 'https') and
    #        (parsed_url.netloc != 'gqlapp.appspot.com') and
    #        (parsed_url.netloc != 'localhost')) :
    #      url = parsed_url.geturl()
    #      print '>> POST proxy %s' % url
    #      req = urllib2.Request(url)
    #      response = urllib2.urlopen(req)
    #      content = response.read()
    #      content = content.replace('https://', 'http://')
    #
    #    try :
    #      ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
    #      if ctype == 'multipart/form-data' :
    #        query = cgi.parse_multipart(self.rfile, pdict)
    #      self.send_response(301)
    #
    #      self.end_headers()
    #      upfilecontent = query.get('upfile')
    #      print "filecontent", upfilecontent[0]
    #      self.wfile.write("<HTML>POST OK.<BR><BR>")
    #      self.wfile.write(upfilecontent[0])
    #
    #    except :
    #      pass

  def _normalize_html_file_path(self, path) :
    path = (curdir + sep + path).strip()
    path = path.replace('//', '/')

    if path.startswith('./') :
      path = path.replace('./', '')

    if path.startswith('/') :
      path = path[1 :]

    if path.endswith('/tests') or path == 'tests' :
      return path

    if path.endswith('/') :
      path = path[0 :len(path) - 2]

    if not path.endswith('.html') :
      path = path + '/index.html'

    return path

  def _get_path_type(self, path) :
    pos = path.rfind('.')
    if pos < 0 :
      return None
    return path[pos + 1 :]

  def _get_file(self, path) :
    f = open(curdir + sep + path)
    content = f.read()
    f.close()
    return content

  def _translate_html(self, html) :
    meta = HTML_META % (self._scale, self._scale, self._scale)

    if html.find('<head>') > -1 :
      html = html.replace('<head>', '<head>' + meta)
    elif html.find('<html>') > -1 :
      html = html.replace('<html>', '<htm>' + meta)
    else :
      html = meta + html
    return html

  def _set_cookie(self, name, value) :
    cookie = Cookie.SimpleCookie()
    cookie[name] = value
    self.send_header('Set-Cookie', cookie.output(header=''))

  def _get_cookie(self, name, default=None) :
    if "Cookie" in self.headers :
      c = Cookie.SimpleCookie(self.headers["Cookie"])
      if name in c :
        return c[name].value
    return default


def main() :
  try :
    # port must not be smaller than 1024
    server = HTTPServer(('', 8888), WebHandler)
    print 'started httpserver...\n\nhttp://%s:%s/tests' % (
      get_local_ip.get_local_ip(), 8888)
    server.serve_forever()
  except KeyboardInterrupt :
    print '^C received, shutting down server'
    server.socket.close()

if __name__ == '__main__' :
  main()

