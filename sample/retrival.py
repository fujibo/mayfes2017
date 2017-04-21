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
LAYER = "fc6"

in_size = 227 # image_dims

mean_image = np.load(MEAN_FILE)

GPU = False
if GPU:
    gpu_device = 0
    cuda.get_device(gpu_device).use()
    xp = cuda.cupy

model = caffe.CaffeFunction(PRETRAINED)
if GPU:
    model.to_gpu(gpu_device)

FEATURE_PATH = FEATURE + "/"
RESULT_PATH = "result_chainer/" + FEATURE + "/"
if not os.path.isdir(RESULT_PATH):
    os.makedirs(RESULT_PATH)
titles = ["Belmondo"]
#titles = ["MeteoSanStrikeDesu","SaladDays_vol18","HinagikuKenzan","HarukaRefrain"]
#titles = ["Belmondo", "LoveHina_vol14", "GOOD_KISS_Ver2", "YamatoNoHane", "Arisa", "BakuretsuKungFuGirl", "AisazuNihaIrarenai"]
number = len(titles)

def query1(query_path):
    QUERY_PATH = query_path
    global QUERY_NAME
    QUERY_NAME = "temp"
    if not os.path.isdir(RESULT_PATH + QUERY_NAME):
        os.mkdir(RESULT_PATH + QUERY_NAME)

    image = cv2.imread(QUERY_PATH)
    image = cv2.resize(image, (in_size, in_size))

    mean_image = np.load(MEAN_FILE)
    mean_image = cv2.resize(mean_image.transpose(1, 2, 0), (in_size, in_size)).transpose(2, 0, 1)

    image = image.transpose(2, 0, 1).astype(np.float32) - mean_image
    image = image.astype(np.float32)
    if GPU:
        image = chainer.Variable(xp.array([image]), volatile=True)
    else:
        image = chainer.Variable(np.array([image]), volatile=True)

    global query
    query = model(inputs={'data': image}, outputs=['fc6'], disable=['relu6', 'drop6'], train=False)[0]

    # query: 1 x 4096
    query = query.data.flatten()
    query = chainer.cuda.to_cpu(query)

distance = []
data = []
feature_value = []
for title in titles:
    propasals = np.load(FEATURE_PATH + title + ".npz")

    for key, windows in propasals.iteritems():

        for window in windows:
            feature_value.append(window[4:])
            data.append([key,window[:4]])

feature_value = np.array(feature_value)
#feature_valueが特徴量をいれた配列、dataが
#ここでdistance計算？
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


    result_data = {"path": OLD_PATH, "title":title, "page":str(page).zfill(3), "x1":x1, "y1":y1, "x2":x2, "y2":y2}
    results_list.append(result_data)
    print(results_list)
    #img = cv2.imread(OLD_PATH)
    #cv2.imwrite(NEW_PATH, img[y1:y2, x1:x2])
