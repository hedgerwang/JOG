import commands
import re
import os

local_ip_pattern = re.compile(
  r'(\s[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)'
)


def get_local_ip() :
  text = str(commands.getoutput('ifconfig'))
  # print text
  for match in local_ip_pattern.findall(text) :
    if match.strip() != '127.0.0.1' :
      return match.strip()

  return None


if __name__ == '__main__' :
  os.system('clear')
  print get_local_ip()
