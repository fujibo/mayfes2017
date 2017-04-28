# mayfes2017
漫画のけんさくをしよう！
覚えきれない

## 実行方法
**本番環境ではOpenCVを使用しているのでビルドするか，wikiを参照して入れる必要あり**

```bash
$ cd ./WebGUI/image/
$ ln -s (MayFes_Testへのpath)/Belmondo Belmondo
```
```bash
$ cd (path_to_mayfes2017)
$ cd ../ 
$ ln -s (path_to_MayFes_test)/manga6_92000.caffemodel manga6_92000.caffemodel
$ ln -s (path_to_MayFes_test)/manga6_feature.prototxt manga6_feature.prototxt
$ ln -s (path_to_MayFes_test)/manga6_mean.npy manga6_mean.npy
$ ln -s (path_to_MayFes_test)/removed_manga6_selective100 removed_manga6_selective100
```

### 環境構築済みの場合
```bash
$ python index.py
```
としてから，ブラウザのURLに"localhost:8080/"と入力

### 環境構築がまだの場合
```bash
$ sudo apt-get install python3-pip
$ sudo pip3 install bottle
$ python3 index.py
```
としてから，ブラウザのURLに"localhost:8080/"と入力
