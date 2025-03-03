# Cesium Spatial ID Visualizer

このプロジェクトは、Cesium を用いてバイナリ形式の spatial ID を可視化する Web アプリケーションです。CSV ファイルから binaryId 列を読み込み、各オブジェクトの元データ（標高、経度、緯度、時刻）を復元し、Cesium 上に描画します。

## ファイル構成

    Cesiumview/
    ├── index.html                // エントリーポイント（HTML）
    └── src/
        ├── config.js             // Cesium のアクセストークン設定
        ├── calculate_spatial.js  // spatial ID の計算・変換関数群
        ├── viewer.js             // Cesium Viewer の初期化
        ├── ui.js                 // ファイル選択、情報表示、検索パネルの生成
        ├── utils.js              // 補助関数（computeAxisBounds）
        ├── csvProcessor.js       // CSV 読込、解析、エンティティ描画、検索処理
        └── app.js                // 各モジュールの初期化

## セットアップ

1. 本プロジェクトをローカルにクローンまたはダウンロードしてください。

2. Cesiumトークンを取得し、トークンをconfig_example.jsに書き込んでください。ファイル名をconfig.jsに名前を変更してください

3. ターミナルで下記のコマンドを実行し、ローカルサーバーを起動します。

   ```bash
   npx http-server .

   ```
4. ブラウザで下記の URL にアクセスしてください。

    (http://127.0.0.1:8080)
## 使い方
1. ブラウザ上で表示される画面左上にある「ファイル選択」ボタンから、binaryId の CSV ファイルを選択してください。
- 例: data/Sample/test.csv

2. CSV ファイルを読み込むと、各行の binaryId から各オブジェクトの元データが復元され、Cesium 上に描画されます。

3. 右上の検索パネルに binaryId を入力して、対応するオブジェクトの位置にカメラを移動させることも可能です。

## 空間IDの仕様
- Headerが各軸のズームレベルを表します。(10100=ZoomLv.20)
- 最大ズームレベルは20になります。(strのビット数が最大値)
- time_span=3600,time=2025-03-02T00:00:00Zが設定されています。ブラウザの下のバーで時間を操作してください。このIDは2025年3月2日,0:00~1:00の間に表示されます。
   ```bash
   Header_f/Header_x/Header_y/str_f/str_x_str_y/time_span/time
   10100/10100/10100/00000000000000011111/11100011100000101101/01100011001011001011/111000010000/1110110000011111000
   ```
- 各ヘッダーのズームレベルは、ボクセル生成時に参照するbit数を示します。下記はHeader_x=10000=16に変更したものです。このidはCesium_view/data/test2.csvにあるので入力で使用してみてください。
   ```bash
   Header_f/Header_x/Header_y/str_f/str_x_str_y/time_span/time
   10100/10000/10100/00000000000000011111/11100011100000101101/01100011001011001011/111000010000/1110110000011111000
   ```