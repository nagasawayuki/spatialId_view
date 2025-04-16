import csv
import geohash2 as geohash
from pathlib import Path

# 入出力ファイルのパス（柔軟に管理できるように）
BASE_DIR = Path(__file__).resolve().parent.parent / "Data"
INPUT_FILE = BASE_DIR / "random_spatiotemporal_events_april15.csv"
OUTPUT_FILE = BASE_DIR / "random_geohash_events.csv"

# Geohash の精度（最大12、一般用途は9前後でOK）
GEOHASH_PRECISION = 9

def convert_to_geohash(input_path, output_path, precision):
    with open(input_path, newline='') as infile, open(output_path, "w", newline='') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + ["geohash"]
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        
        count = 0
        for row in reader:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            ghash = geohash.encode(lat, lon, precision=precision)
            row["geohash"] = ghash
            writer.writerow(row)
            count+=1
            print(f"保存数：{count}回")

    print(f"✅ Geohash に変換完了: {output_path.name}")

if __name__ == "__main__":
    convert_to_geohash(INPUT_FILE, OUTPUT_FILE, GEOHASH_PRECISION)