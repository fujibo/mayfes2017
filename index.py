from bottle import route, run, template, request, static_file, HTTPResponse 
import os
import json

@route('/ping', method='GET')
def ping():
    body = {"res":"pong"}
    r = HTTPResponse(status=200, body=json.dumps(body))
    r.set_header('Content-Type', 'application/json')
    return r

@route('/ping', method='POST')
def post():
    body = request.forms
    r = HTTPResponse(status=200, body=body)
    return r

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run(host = '0.0.0.0', port = port)
