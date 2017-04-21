import lib

def main():
    # 別のファイルのグローバル変数の初期化
    lib.init()
    # グローバル変数のそのファイル内での呼び出し
    lib.put()
    # 今回の使い方
    lib.init_mat()
    lib.put_mat()

if __name__ == '__main__':
    main()
