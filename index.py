from bottle import route, run, template, request, static_file, HTTPResponse, TEMPLATE_PATH
from datetime import datetime
import os
import json
import base64
TEMPLATE_PATH.append("./WebGUI")
@route('/')
def index():
    return template("index")
    #return static_file('index.html', root='./WebGUI')

@route('/js/<filename>')
def js_static(filename):
    return static_file(filename, root='./WebGUI/js')
@route('/css/<filename>')
def js_static(filename):
    return static_file(filename, root='./WebGUI/css')
@route('/image/<filename>')
def js_static(filename):
    return static_file(filename, root='./WebGUI/image')

@route('/ping', method='GET')
def ping():
    body = {datetime.now().strftime("%Y/%m/%d %H:%M:%S"):"pong"}
    r = HTTPResponse(status=200, body=json.dumps(body))
    r.set_header('Content-Type', 'application/json')
    return r

@route('/ping', method='POST')
def post():
    body = request.forms.get('time')
    r = HTTPResponse(status=200, body=body)
    return r

@route('/searching', method='POST')
def search():
    
    upload = request.forms.get('image')
    #name, ext = os.path.splitext(upload.image)
    print(upload)
    #upload.save("/tmp", overwrite=Ture
    decfile = base64.b64decode(upload)
    fout = open('temp.png', 'wb')
    fout.write(decfile)
    fout.close
    
    body = {"img":[{"path":"string", "title":"string", "page": 0, "x1":0, "x2":0, "y1":0, "y2":0}]} 
    r = HTTPResponse(status=200, body=json.dumps(body))
    return r




if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    run(port = port)
