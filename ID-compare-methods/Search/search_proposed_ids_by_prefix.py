import csv
from pathlib import Path


def check_f_prefix(proposed_id_bytes, f_bit_length, zoomLv, target_prefix):
    total_bits = len(proposed_id_bytes) * 8
    binary_int = int.from_bytes(proposed_id_bytes, byteorder='big')

    # f の位置：ヘッダー + 各軸のビット長情報 = 5bit×4 = 20bit + padding4 = 24bitから始まる
    f_start_bit = 24
    shift = total_bits - f_start_bit - f_bit_length
    f_value = (binary_int >> shift) & ((1 << f_bit_length) - 1)
    f_prefix = f_value >> (f_bit_length - zoomLv)

    return f_prefix == target_prefix

def check_x_prefix(proposed_id_bytes, x_bit_length, zoomLv, target_prefix):
    total_bits = len(proposed_id_bytes) * 8
    binary_int = int.from_bytes(proposed_id_bytes, byteorder='big')

    # f の位置：ヘッダー + 各軸のビット長情報 = 5bit×4 = 20bit + padding4 = 24bitから始まる
    x_start_bit = 46
    shift = total_bits - x_start_bit - x_bit_length
    x_value = (binary_int >> shift) & ((1 << x_bit_length) - 1)
    x_prefix = x_value >> (x_bit_length - zoomLv)

    return x_prefix == target_prefix

def check_y_prefix(proposed_id_bytes, y_bit_length, zoomLv, target_prefix):
    total_bits = len(proposed_id_bytes) * 8
    binary_int = int.from_bytes(proposed_id_bytes, byteorder='big')

    # f の位置：ヘッダー + 各軸のビット長情報 = 5bit×4 = 20bit + padding4 = 24bitから始まる
    y_start_bit = 68
    shift = total_bits - y_start_bit - y_bit_length
    y_value = (binary_int >> shift) & ((1 << y_bit_length) - 1)
    y_prefix = y_value >> (y_bit_length - zoomLv)

    return y_prefix == target_prefix

def check_t_prefix(proposed_id_bytes, t_bit_length, zoomLv, target_prefix):
    total_bits = len(proposed_id_bytes) * 8
    binary_int = int.from_bytes(proposed_id_bytes, byteorder='big')

    # f の位置：ヘッダー + 各軸のビット長情報 = 5bit×4 = 20bit + padding4 = 24bitから始まる
    t_start_bit = 90
    shift = total_bits - t_start_bit - t_bit_length
    t_value = (binary_int >> shift) & ((1 << t_bit_length) - 1)
    t_prefix = t_value >> (t_bit_length - zoomLv)

    return t_prefix == target_prefix

def search_matching_rows(input_path, output_path):
    with open(input_path, newline='') as infile, open(output_path, "w", newline='') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        match_count = 0
        for row in reader:
            try:
                proposed_id_bytes = eval(row["proposed_id"])  # b'...' を bytes に変換
                if (check_f_prefix(proposed_id_bytes, f_bit_length=22, zoomLv=16, target_prefix=0b0000000000000000) and
                    check_x_prefix(proposed_id_bytes, x_bit_length=22,zoomLv=16, target_prefix=0b1110001101111001) and
                    check_y_prefix(proposed_id_bytes, y_bit_length=22,zoomLv=16, target_prefix=0b0110001100110001) and
                    check_t_prefix(proposed_id_bytes, t_bit_length=22,zoomLv=16, target_prefix=0b1100111111111011)
                    ):
            
                    writer.writerow(row)
                    match_count += 1
            except Exception as e:
                print(f"❌ 行の処理中にエラー: {e}")
        
        print(f"✅ 検索完了。{match_count} 件ヒット。")

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parents[2] / "Data"
    INPUT_FILE = BASE_DIR / "random_proposed_id_events.csv"
    OUTPUT_FILE = BASE_DIR / "filtered_proposed_id_events.csv"

    search_matching_rows(INPUT_FILE, OUTPUT_FILE)



'''
ZoomLv 0~22
f   min:0m          0000000000000000000000
    max:300m        0000000000000000100101
    
x   min:139.85      1110001101110010111010
    max:139.95      1110001110000101000111
    
y   min:37.45       0110001100111101101100
    max:37.55       0110001100100110110000
    
t   min:4/14/15:00  1100111111111010010010
    max:4/15/14:59  1100111111111100111010
'''