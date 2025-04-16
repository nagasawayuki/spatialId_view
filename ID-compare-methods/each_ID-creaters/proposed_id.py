import csv
from pathlib import Path
from calculate_spatial_id import (
    calculate_position_spatial_id,
    calculate_time_spatial_id,
    spatial_id_to_binary
)
import base64

# 入出力ファイルのパス
BASE_DIR = Path(__file__).resolve().parent.parent / "Data"
INPUT_FILE = BASE_DIR / "random_spatiotemporal_events_april15.csv"
OUTPUT_FILE = BASE_DIR / "random_proposed_id_events.csv"

# 空間・時間の解像度
ZOOM_LEVEL = 22  # 空間解像度
TIME_ZOOM = 22  # 時間解像度

def convert_to_proposed_id(input_path, output_path, z, z_i):
    with open(input_path, newline='') as infile, open(output_path, "w", newline='') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = ["No."] + reader.fieldnames + ["bit_id"]+ ["proposed_id"] + ["recoverBit_id"]
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        
        count = 1

        for row in reader:
            h = float(row["altitude"])
            lng = float(row["longitude"])
            lat = float(row["latitude"])
            time = row["timestamp"]
            
            f, x, y = calculate_position_spatial_id(z, h, lng, lat)
            i, t = calculate_time_spatial_id(z_i, time)
            binary_id = spatial_id_to_binary(z, f, x, y, i, t)
            byte_array = int(binary_id, 2).to_bytes((len(binary_id) + 7) // 8, byteorder='big')
            binary_str = bin(int.from_bytes(byte_array, byteorder='big'))[2:]
            row["No."] =count
            row["proposed_id"] =byte_array
            row["bit_id"] = binary_id
            row["recoverBit_id"] = binary_str
            writer.writerow(row)
            count += 1

    print(f"✅ 提案IDに変換完了: {output_path.name}")

if __name__ == "__main__":
    convert_to_proposed_id(INPUT_FILE, OUTPUT_FILE, ZOOM_LEVEL, TIME_ZOOM)
