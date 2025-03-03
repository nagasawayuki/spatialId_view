# Cesium Spatial ID Visualizer

このプロジェクトは、Cesium を用いてバイナリ形式の spatial ID を可視化する Web アプリケーションです。CSV ファイルから binaryId 列を読み込み、各オブジェクトの元データ（標高、経度、緯度、時刻）を復元し、Cesium 上に描画します。

## ファイル構成

    project-root/
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

2. ターミナルで下記のコマンドを実行し、ローカルサーバーを起動します。

   ```bash
   npx http-server .

   ```
3. ブラウザで下記の URL にアクセスしてください。

    (http://127.0.0.1:8080)
## 使い方
1. ブラウザ上で表示される画面左上にある「ファイル選択」ボタンから、binaryId の CSV ファイルを選択してください。
- 例: data/Sample/test.csv

2. CSV ファイルを読み込むと、各行の binaryId から各オブジェクトの元データが復元され、Cesium 上に描画されます。

3. 右上の検索パネルに binaryId を入力して、対応するオブジェクトの位置にカメラを移動させることも可能です。

