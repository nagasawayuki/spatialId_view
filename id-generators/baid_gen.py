import csv


def generate_ids_from_binary_id(
    base_id: str,
    elev_steps: int,
    lat_steps: int,
    lon_steps: int,
    t_steps: int
) -> list:
    def bin_to_int(b): return int(b, 2)
    def int_to_bin(n, length): return format(n, f'0{length}b')

    # 分割（スラッシュ区切りのbase_idを受け取る）
    f_bit_len_bin, x_bit_len_bin, y_bit_len_bin, t_bit_len_bin, f_bin, x_bin, y_bin, t_bin = base_id.split(
        '/')

    # ビット長を数値化
    f_bit_len = bin_to_int(f_bit_len_bin)
    x_bit_len = bin_to_int(x_bit_len_bin)
    y_bit_len = bin_to_int(y_bit_len_bin)
    t_bit_len = bin_to_int(t_bit_len_bin)

    # 各値を数値化
    f_base = bin_to_int(f_bin)
    x_base = bin_to_int(x_bin)
    y_base = bin_to_int(y_bin)
    t_base = bin_to_int(t_bin)

    # ヘッダー部分をバイナリで結合
    header_bin = f_bit_len_bin + x_bit_len_bin + y_bit_len_bin + t_bit_len_bin

    generated_ids = []
    cnt = 0

    for i in range(elev_steps):
        f_current = f_base + i
        for j in range(lat_steps):
            x_current = x_base + j
            for k in range(lon_steps):
                y_current = y_base + k
                for m in range(t_steps):
                    t_current = t_base + 2*m

                    f_str = int_to_bin(f_current, f_bit_len)
                    x_str = int_to_bin(x_current, x_bit_len)
                    y_str = int_to_bin(y_current, y_bit_len)
                    t_str = int_to_bin(t_current, t_bit_len)

                    # スラッシュなしのバイナリID
                    new_id = header_bin + f_str + x_str + y_str + t_str

                    generated_ids.append(new_id)
                    cnt += 1

                    print(
                        f"{f_bit_len_bin}/{x_bit_len_bin}/{y_bit_len_bin}/{t_bit_len_bin}/{f_str}/{x_str}/{y_str}/{t_str}")

    return generated_ids


def save_ids_to_csv(ids: list, output_csv_path: str):
    with open(output_csv_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["binaryId"])
        for id_str in ids:
            writer.writerow([id_str])
    print(f"\n✅ {len(ids)} 件のIDを '{output_csv_path}' に保存しました。")


base_id = "10110/10110/10110/10110/0000000000000000000000/1110001101110010111010/0110001100111101101100/1100111111111000101000"
ids = generate_ids_from_binary_id(
    base_id=base_id,
    elev_steps=10,
    lat_steps=10,
    lon_steps=10,
    t_steps=3
)
save_ids_to_csv(ids, "generated_ids.csv")
