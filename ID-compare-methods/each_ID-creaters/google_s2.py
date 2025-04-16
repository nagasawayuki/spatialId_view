import csv
from pathlib import Path
from s2sphere import LatLng, CellId

# 入出力ファイルのパス
BASE_DIR = Path(__file__).resolve().parent.parent / "Data"
INPUT_FILE = BASE_DIR / "random_spatiotemporal_events_april15.csv"
OUTPUT_FILE = BASE_DIR / "random_s2_events.csv"

# 使用するS2 Cellのレベル（推奨：12）
S2_LEVEL = 12

def convert_to_s2(input_path, output_path, level):
    with open(input_path, newline='') as infile, open(output_path, "w", newline='') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + ["s2_cell_id"]
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            latlng = LatLng.from_degrees(lat, lon)
            cell = CellId.from_lat_lng(latlng).parent(level)
            row["s2_cell_id"] = str(cell.id())
            writer.writerow(row)

    print(f"✅ S2 Cell ID に変換完了: {output_path.name}")

if __name__ == "__main__":
    convert_to_s2(INPUT_FILE, OUTPUT_FILE, S2_LEVEL)
