# meanfile prototxt model feature query_path query_name

import sys, os
import scipy as sp
import numpy as np
import scipy.spatial.distance as dis

import chainer
from chainer import Function, gradient_check, Variable, optimizers, serializers, utils
from chainer import Link, Chain, ChainList, cuda
import chainer.functions as F
import chainer.links as L
import matplotlib.pyplot as plt
from chainer.functions import caffe
import cupy
from PIL import Image
import cv2

MEAN_FILE = "manga6_mean.npy"
MODEL_FILE = "manga6_feature.prototxt"
PRETRAINED = "manga6_92000.caffemodel"
FEATURE = "removed_manga6_selective100"
# LAYER = "fc6wi"
LAYER = "fc6"

in_size = 227 # image_dims

mean_image = np.load(MEAN_FILE)
# http://mktozk.hateblo.jp/entry/optimize-input-image-with-chainer
def preprocess(pil_image, resize=True):
    if resize:
        pil_image = pil_image.resize((in_size, in_size))
    pil_image = pil_image.convert('RGB')
    in_ = np.asarray(pil_image, dtype='f')
    # net.transformer.set_channel_swap('data',(2,1,0))
    # in_ = in_.transpose(2, 0, 1)
    in_ = in_.transpose(2, 0, 1)
    in_ = in_[::-1]
    # net.transformer.set_mean('data', np.load(MEAN_FILE))
    in_ -= mean_image
    return in_

GPU = True
if GPU:
    gpu_device = 0
    cuda.get_device(gpu_device).use()
    xp = cuda.cupy

net = caffe.CaffeFunction(PRETRAINED)
# net = caffe.Classifier(MODEL_FILE, PRETRAINED, image_dims=(227, 227))
if GPU:
    net.to_gpu(gpu_device)

# net.transformer.set_raw_scale('data',255)

FEATURE_PATH = FEATURE + "/"
RESULT_PATH = "result_chainer/" + FEATURE + "/"
if not os.path.isdir(RESULT_PATH):
    os.makedirs(RESULT_PATH)

#titles = ["LoveHina_vol14"]
titles = ["Belmondo"]
#titles = ["MeteoSanStrikeDesu","SaladDays_vol18","HinagikuKenzan","HarukaRefrain"]
#titles = ["Belmondo", "LoveHina_vol14", "GOOD_KISS_Ver2", "YamatoNoHane", "Arisa", "BakuretsuKungFuGirl", "AisazuNihaIrarenai"]
number = len(titles)

QUERY_PATH = sys.argv[1]
QUERY_NAME = sys.argv[2]
if not os.path.isdir(RESULT_PATH + QUERY_NAME):
    os.mkdir(RESULT_PATH + QUERY_NAME)
# image = caffe.io.load_image(QUERY_PATH)
# image = Image.open(QUERY_PATH)
# image = preprocess(image)
image = cv2.imread(QUERY_PATH)
image = cv2.resize(image, (256, 256))
image = image.transpose(2, 0, 1) - mean_image
# image = image[:, 14:-15, 14:-15]
image = image[:, 15:-14, 15:-14]
image = image.astype(np.float32)

if GPU:
    image = chainer.Variable(xp.array([image]), volatile=True)
else:
    image = chainer.Variable(np.array([image]), volatile=True)
# net.predict([image])
# query = net.blobs[LAYER].data[INDEX].flatten()
query = net(inputs={'data': image}, outputs=[LAYER], disable=['relu6'], train=False)[0]
# query: 1 x 4096
query = query.data.flatten()
query = chainer.cuda.to_cpu(query)

distance = []
data = []

for title in titles:
    propasals = np.load(FEATURE_PATH + title + ".npz")
    new_proposals = {}
    for key, windows in propasals.iteritems():
        page = key.split("_p")[1]
        for window in windows:
            d = dis.cosine(window[4:], query)
            distance.append(d)
            data.append([key, window[:4]])

distance_index = np.argsort(distance)
for j, v in enumerate(distance_index[:100]):
    title = data[v][0].split("_p")[0]
    page = data[v][0].split("_p")[1]
    window = data[v][1]
    x1 = window[0]
    y1 = window[1]
    x2 = window[2]
    y2 = window[3]
    NEW_PATH = RESULT_PATH + QUERY_NAME + "/" + str(j) + "_" + title + "_" + str(page).zfill(3) + ".jpg"
    OLD_PATH = title + "/" + title + "_" + str(page).zfill(3) + ".jpg"
    # img = caffe.io.load_image(OLD_PATH)
    img = cv2.imread(OLD_PATH)
    cv2.imwrite(NEW_PATH, img[y1:y2, x1:x2])
    # sp.misc.imsave(NEW_PATH, img[y1:y2, x1:x2])
