import sys, os
from lopq import LOPQModel, LOPQSearcher
import numpy as np
import time

def main(new=True):
    # data: 3000 x 128dim
    if not new:
        # load data
        data = np.load('./data.npy')
    else:
        data = np.vstack((np.random.rand(1000, 128), np.random.rand(1000, 128) + 1, np.random.rand(1000, 128) - 1))
        print 'make data'
        # save data
        np.save('data.npy', data)

    # wanted to know this nearest neighbors
    x = np.ones(128) * 2

    print 'naive implementation'
    start = time.time()
    dist = np.sum(np.power((data - x), 2), axis=1)
    res = np.argsort(dist)
    print res[0:10] # return indices; top 10
    print time.time() - start, 's taken for naive NNsearch'

    model = None
    if not new:
        # load model
        model = LOPQModel.load_mat('params.mat')
    else:
        # Define a model and fit it to data
        model = LOPQModel(V=3, M=2, subquantizer_clusters=64)
        start = time.time()
        model.fit(data)
        print time.time() -start, 's taken for model fitting'
        # save model
        model.export_mat('params.mat')

    # Compute the LOPQ codes for a vector
    # if we define SC as subquantizer_clusters,
    # input vec(128dim); output: coarse codes(V, V), fine codes(SC, SC) because M = 2

    """
    for i in xrange(10):
        y = np.random.rand(128)
        code = model.predict(y)
        print 'output: ', code
    """

    # Create a searcher to index data with the model
    searcher = LOPQSearcher(model)
    searcher.add_data(data)

    start = time.time()
    # Retrieve ranked nearest neighbors
    nns = searcher.search(x, quota=10)
    ans = [nns[0][i][0] for i in range(10)]
    print ans
    print time.time() -start, 's taken for prediction top 10'

    count = 0
    for element in ans:
        if element in res[0:10]:
            count += 1
    else:
        print 'accuracy: ', count, '/', 10

if __name__ == '__main__':
    if len(sys.argv) == 1:
        print 'python test.py -new for making new data and model'
        print 'python test.py -load for loading data and model'
        exit(0)

    if sys.argv[1] == '-new':
        print 'make new dataset'
        main(True)
    else:
        main(False)
