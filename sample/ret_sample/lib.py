import numpy as np

a = None
mat = None

def init():
    global a
    a = np.random.rand(10)
    print('set a:', a)

def init_mat():
    global mat
    # (4, ) -> (1, 4)
    # 予めx, y, zを読みだしておいて，matに格納しておく
    x = np.random.rand(4).reshape(1, -1)
    y = np.random.rand(4).reshape(1, -1)
    z = np.random.rand(4).reshape(1, -1)
    # return (3, 4)
    mat = np.vstack((x, y, z))
    # 正規化をしておく
    mat = mat / np.linalg.norm(mat, axis=1).reshape(-1, 1)

def put():
    print('func put')
    print(a)

def put_mat():
    print(mat)
