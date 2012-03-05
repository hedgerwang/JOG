#!/usr/bin/env python
#Copyright Jon Berg , turtlemeat.com

import string, cgi, time
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
#import pri
import cssrequire
import jsrequire


class WebHandler(BaseHTTPRequestHandler) :
  def do_GET(self) :
    try :
      path = self.path
      type = self._get_path_type(path)

      if path.endswith('/') :
        path = path + 'index.html'
        type = 'html'
      elif type is None :
        path = path + '/index.html'
        type = 'html'

      if type == 'html' :
        mine = 'text/html'
        content = self._get_file(path)
      elif type == 'ico' :
        mine = 'image/vnd.microsoft.icon'
        content = ''
      elif type == 'js' :
        mine = 'text/javascript'
        content = jsrequire.get(path, None, True)
      elif  type == 'css':
        mine = 'text/css'
        content = cssrequire.get(path, None, True)
      else :
        mine = 'text/plain'
        content = 'Not supported "%s, %s"' % (type, path)

      self.send_response(200)
      self.send_header('Content-type', mine)
      self.end_headers()
      self.wfile.write(content)
      return

    except IOError as inst :
      self.send_error(404, 'File Not Found: "%s"' % inst)

  def do_POST(self) :
    global rootnode
    try :
      ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
      if ctype == 'multipart/form-data' :
        query = cgi.parse_multipart(self.rfile, pdict)
      self.send_response(301)

      self.end_headers()
      upfilecontent = query.get('upfile')
      print "filecontent", upfilecontent[0]
      self.wfile.write("<HTML>POST OK.<BR><BR>")
      self.wfile.write(upfilecontent[0])

    except :
      pass

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

