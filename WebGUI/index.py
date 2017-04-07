from bottle import route, run, template, request, static_file, HTTPResponse
import json

@route('/ping', method='GET')
def ping():
  body = {"res":"pong"}
  r = HTTPResponse(status=200, body=json.dumps(body))
  r.set_header('Content-Type', 'application/json')
  return r

if __name__ == '__main__':
  run(host = '0.0.0.0', port = 80)
