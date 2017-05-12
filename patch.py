import sys
import os
import scipy as sp
import numpy as np

import chainer
from chainer import Function, gradient_check, Variable, optimizers, serializers, utils
from chainer import Link, Chain, ChainList
import chainer.functions as F
import chainer.links as L
from chainer.functions import caffe
import cv2

import pickle

print('loading caffemodel')
model = caffe.CaffeFunction('../manga6_92000.caffemodel')
print('making pickle')
pickle.dump(model, open('../model.pkl', 'wb'))

print('symbolic link')
# titles = ["MeteoSanStrikeDesu","SaladDays_vol18","HinagikuKenzan","HarukaRefrain", "Belmondo", "LoveHina_vol14", "GOOD_KISS_Ver2", "YamatoNoHane", "Arisa", "AisazuNihaIrarenai"]
titles = ['Belmondo']
os.chdir('./WebGUI/image')
# トーン除去前のデータ
# os.remove('Belmondo')

for title in titles:
    os.symlink('../../../' + title, './' + title)
