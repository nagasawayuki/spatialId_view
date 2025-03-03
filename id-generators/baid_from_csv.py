import csv
import os
from calculate_spatial_id import (
    calculate_position_spatial_id,
    calculate_time_spatial_id,
    spatial_id_to_binary
)

# 入力CSVファイルのパス（適宜変更してください）
csv_file = './cesium_view/test_data/test7.csv'

# 入力ファイル名を抽出し、出力CSVファイル名を作成
input_filename = os.path.basename(csv_file)
output_csv = f'BinaryIDs_from_{input_filename}'

# 出力先ディレクトリが存在しない場合は作成する（出力ファイルにディレクトリパスが含まれる場合）
output_dir = os.path.dirname(output_csv)
if output_dir and not os.path.exists(output_dir):
    os.makedirs(output_dir)

# CSVファイルの読み込みと出力
with open(csv_file, mode='r', encoding='utf-8') as infile, \
     open(output_csv, mode='w', encoding='utf-8', newline='') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    # ヘッダー行を書き込む
    writer.writerow(["binaryId", "spatial_id", "height", "longitude", "latitude", "time"])
    
    for row in reader:
        # 入力行が5列未満の場合はスキップ（必要なデータが不足している）
        if len(row) < 5:
            print("データ不足の行:", row)
            continue
        
        try:
            # 各値を適切な型に変換
            zoomLv = int(row[0])
            height = float(row[1])
            longitude = float(row[2])
            latitude = float(row[3])
            time_str = row[4]  # 時刻は文字列として扱います（例："2025-02-26T00:10:00Z"）
        except Exception as e:
            print("行の処理エラー:", row, e)
            continue
        
        # main.pyと同様のパラメータ設定
        i_time = 3600  # 時間幅（例：1時間）
        # 空間IDの算出
        f, x, y = calculate_position_spatial_id(zoomLv, height, longitude, latitude)
        # 時間IDの算出
        t = calculate_time_spatial_id(i_time, time_str)
        # 識別文字列（デバッグ用）
        id_string = f"{zoomLv}/{f}/{x}/{y}_{i_time}/{t}"
        # main.pyと同じ呼び出し方でbinaryIDを生成
        binary_id = spatial_id_to_binary(zoomLv, f, x, y, i_time, t)
        
        # 出力CSVへ書き込み
        writer.writerow([binary_id, id_string, height, longitude, latitude, time_str])


        # 各行の処理終了後のデバッグ出力（必要に応じてコメントアウト）
        print("zoomLv:", zoomLv)
        print("height:", height)
        print("longitude:", longitude)
        print("latitude:", latitude)
        print("start_time (最終):", time_str)
        print("--------------")
