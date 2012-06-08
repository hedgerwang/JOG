import socket
import socket
import signal
import sys
import commands
import re
import get_local_ip


# Source http://code.activestate.com/recipes/491264


class DNSQuery :
  def __init__(self, data) :
    self.data = data
    self.domain = ''

    tipo = (ord(data[2]) >> 3) & 15   # Opcode bits
    if tipo == 0 :                     # Standard query
      ini = 12
      lon = ord(data[ini])
      while lon != 0 :
        self.domain += data[ini + 1 :ini + lon + 1] + '.'
        ini += lon + 1
        lon = ord(data[ini])

  def request(self, ip = None) :
    packet = ''
    if self.domain :
      packet += self.data[:2] + "\x81\x80"
      packet += self.data[4 :6]
      # Questions and Answers Counts
      packet += self.data[4 :6] + '\x00\x00\x00\x00'
      # Original Domain Name Question
      packet += self.data[12 :]
      # Pointer to domain name
      packet += '\xc0\x0c'
      # Response type, ttl and resource data length -> 4 bytes
      packet += '\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04'
      packet += str.join('', map(lambda x : chr(int(x)),
                                 ip.split('.'))) # 4bytes of IP
    return packet


client_sock = None

def cleanup_client_sock(var_a=None, var_b=None) :
  global client_sock

  if client_sock is not None :
    client_sock.close()
    client_sock = None

# Catch some signals
signal.signal(signal.SIGINT, cleanup_client_sock)
signal.signal(signal.SIGTERM, cleanup_client_sock)

def get_ip_by_domain(domain) :
  global client_sock

  if domain.find('gqlapp') > -1 :
    return get_local_ip.get_local_ip()

  client_sock = socket.socket()
  client_sock.connect(('127.0.0.1', 6052))
  client_sock.send(domain)
  ip = client_sock.recv(276)
  cleanup_client_sock()
  return ip


def main() :
  print '#' * 80
  print ''
  print 'Note that you can only run this service as a root user (sudo su root)'
  print 'DNS server address is %s' % get_local_ip.get_local_ip()
  print ''
  print '#' * 80
  print 'start DNS Server frontend'

  udps = None
  try :
    udps = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udps.bind(('', 53))

    while 1 :
      data, addr = udps.recvfrom(1024)
      p = DNSQuery(data)
      ip = get_ip_by_domain(p.domain)
      print '> Resolve %s (%s)' % (p.domain, ip)
      udps.sendto(p.request(ip), addr)
  except KeyboardInterrupt :
    print 'Finish DNS Server frontend'
    if udps is not None :
      udps.close()

if __name__ == '__main__' :
  main()
