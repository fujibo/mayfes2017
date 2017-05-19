# -*- coding:utf-8 -*-
from bottle import route, run, template, request, static_file, HTTPResponse, TEMPLATE_PATH, BaseRequest
from datetime import datetime
import os
import json
import base64
import retrival

img_id = 0
global dirname
TEMPLATE_PATH.append("./WebGUI")
print("init: loaded model and libraries")
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
@route('/image/<filename:path>')
def js_static(filename):
    print(filename)
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
    reset = request.forms.get('new')
    print(reset)
    upload = request.forms.get('image')
    global dirname
    global img_id

    decfile = base64.b64decode(upload)
    if reset == '1':
        img_id = 0
        dirname = datetime.now().strftime('%Y_%m_%d_%H%M%S')
        if not os.path.isdir("./images/"+dirname):
            os.mkdir("./images/" + dirname)
    else:
        img_id += 1
    filename = 'image_' + str(img_id) + '.png'
    filepath = './images/' + dirname + '/' + filename
    fout = open(filepath, 'wb')
    fout.write(decfile)
    fout.close()
    retrival.query1(filepath)

    res = retrival.calc()
    body = {"imgs": res}
    # print(body)
    r = HTTPResponse(status=200, body=json.dumps(body))
    return r


if __name__ == '__main__':
    # 元々1MBが上限
    global dirname
    BaseRequest.MEMFILE_MAX *= 16

    retrival.init()
    if not os.path.isdir("./images"):
        os.mkdir("./images")
    dirname = datetime.now().strftime('%Y_%m_%d_%H%M%S')
    if not os.path.isdir("./images/"+dirname):
        os.mkdir("./images/" + dirname)
    img_id = 0

    port = int(os.environ.get('PORT', 8080))
    run(port = port)
