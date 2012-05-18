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


httpHandler = urllib2.HTTPHandler(debuglevel=1)
httpsHandler = urllib2.HTTPSHandler(debuglevel=1)
opener = urllib2.build_opener(httpHandler, httpsHandler)
urllib2.install_opener(opener)

class WebHandler(BaseHTTPRequestHandler) :
  def do_GET(self) :
    try :
      parsed_url = urlparse.urlparse(self.path)
      query_params = urlparse.parse_qs(parsed_url.query)
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

        if type == 'html' :
          mine = 'text/html'
          content = self._get_file(path)
        elif type == 'ico' :
          mine = 'image/vnd.microsoft.icon'
          content = ''
        elif type == 'js' :
          mine = 'text/javascript'
          content = jsrequire.get(path, query_params.get('mode', [None])[0])
        elif  type == 'css' :
          mine = 'text/css'
          content = cssrequire.get(path, query_params.get('mode', [None])[0])
        else :
          mine = 'text/plain'
          content = 'Not supported "%s, %s"' % (type, path)

      self.send_response(200)
      if mine is not None :
        self.send_header('Content-type', mine)
      self.end_headers()
      self.wfile.write(content)
      return

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


def main() :
  try :
    # port must not be smaller than 1024
    server = HTTPServer(('', 8888), WebHandler)
    print 'started httpserver...'
    server.serve_forever()
  except KeyboardInterrupt :
    print '^C received, shutting down server'
    server.socket.close()

if __name__ == '__main__' :
  main()

