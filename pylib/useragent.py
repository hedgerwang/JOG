import re

UA_IPHONE_SIM = """
Mozilla/5.0 (iPhone Simulator; CPU iPhone OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B176 Safari/7534.48.3
""".strip()

UA_CHROME = """
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.52 Safari/536.5
""".strip()

RE_IOS = re.compile(
  r'(iPhone)'
)

def is_ios(ua) :
  print '-' * 80
  print ua
  print '-' * 80
  ma = RE_IOS.findall(ua)
  if ma :
    return True
  return False