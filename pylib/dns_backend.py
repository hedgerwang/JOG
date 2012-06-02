import socket
import threading
import re
import signal
import sys
import get_local_ip


# Source
# http://logicbomblabs.wordpress.com/2010/10/25/python-threads-and-sockets-example-dns-server-and-client/

# This class represents the request handler thread
class RequestHandler(threading.Thread) :
  # Each thread receives the socket and client address from accept()
  def __init__(self, (sock, addr)) :
    self.sock = sock
    self.addr = addr

    threading.Thread.__init__(self)

  # This is where the magic happens
  def run(self) :
    # Domain names are a maximum of 253 characters long
    raw_data = self.sock.recv(253)
    # Remove invalid characters
    domain_name = re.sub('[^a-zA-Z0-9\.\-]', '', raw_data)
    print self.getName() + ' looking up ' + domain_name

    # Here we will "try" to resolve the host and catch any exceptions (failed lookups)
    try :
      # Resolve the name
      ip = socket.gethostbyname(domain_name)
      print '  >> ' + ip
      # Send the IP back to the client
      self.sock.send(ip)
    except socket.gaierror, msg :
      # An exception was raised
      print 'Unable to resolve host ' + domain_name
      # Unknown host, send error message
      self.sock.send('Unable to resolve host ' + domain_name)

    # Close the client socket
    self.sock.close()
    self.sock = None

#
# Setup the server socket and threads list
#
server_sock = socket.socket()
# Setting this option avoids the TIME_WAIT state so that we can rebind faster
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
print 'start DNS server backend %s:6052' % get_local_ip.get_local_ip()
server_sock.bind(('127.0.0.1', 6052))
server_sock.listen(2)
threads = []

# Keyboard Interrupt handler and cleanup routine
def cleanup(*args) :
  print 'Exiting'

  global server_sock
  global threads

  # Close the server socket
  server_sock.close()
  server_sock = None

  # Wait for all threads
  for t in threads :
    t.join()

  sys.exit(0)

# Catch some signals
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

# The "main" loop
# Accepts connections and fires off threads
while True :
  rh = RequestHandler(server_sock.accept())
  rh.daemon = True
  rh.start()
  threads.append(rh)

# Execution never reaches here but this should be the last call
cleanup()