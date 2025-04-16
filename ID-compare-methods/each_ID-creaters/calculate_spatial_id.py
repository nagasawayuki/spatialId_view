import math
from datetime import datetime, timezone

# もとデータから、空間IDを生成する関数
def calculate_position_spatial_id(z, h,lng,lat):
    n = 2**z
    H = 33554432
    lat_rad = lat * math.pi / 180.0
    # 計算
    f = math.floor(n * h / H)
    x = math.floor(n * (lng + 180.0) / 360.0)
    y = math.floor(n / 2.0 * (1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi))
    return f, x, y

# 下の関数の補助（calculate_time_spatial_id）
def unix_converter(time):
    time = datetime.strptime(time, "%Y-%m-%dT%H:%M:%SZ")
    time = time.replace(tzinfo=timezone.utc)
    unix_time = int(time.timestamp())
    return unix_time

# unix_timeから空間IDを生成する
def calculate_time_spatial_id(z_i, time):
    time = unix_converter(time)
    n = 2**z_i
    U = 2147483648
    t = math.floor(n * time / U)
    return z_i,t 

# 空間IDからバイナリ空間IDを生成する関数。各値はヘッダー5bit,ボディ20bitで固定。検索の時とかにヘッダーを変えて参照範囲を決めさせる
def spatial_id_to_binary(z,f,x, y,i,t):
    # ヘッダーは各軸の必要ビット数を5ビット固定のバイナリ文字列にする
    
    header_f = format(z, '05b')
    header_x = format(z, '05b')
    header_y = format(z, '05b')
    header_t = format(i, '05b')
    
    # 各インデックスをz桁のバイナリでゼロパディング
    f_str = format(f, f'0{z}b')
    x_str = format(x, f'0{z}b')
    y_str = format(y, f'0{z}b')
    t_str = format(t, f'0{z}b')
    
    id = f"{header_f}{header_x}{header_y}{header_t}{f_str}{x_str}{y_str}{t_str}"
    return id

# バイナリ空間IDから空間IDを復元する関数
def binary_to_spatial_id(binary_id):
    # 最初の20ビット = 各軸のビット長（5bit × 4軸）
    header_f = binary_id[0:5]
    header_x = binary_id[5:10]
    header_y = binary_id[10:15]
    header_t = binary_id[15:20]

    f_bit_length = int(header_f, 2)
    x_bit_length = int(header_x, 2)
    y_bit_length = int(header_y, 2)
    t_bit_length = int(header_t, 2)

    # 各軸のデータ位置を計算
    f_start = 20
    x_start = f_start + f_bit_length
    y_start = x_start + x_bit_length
    t_start = y_start + y_bit_length

    # 指定されたビット長で切り出す（ゼロ詰めも考慮）
    f_str = binary_id[f_start:x_start].rjust(f_bit_length, '0')
    x_str = binary_id[x_start:y_start].rjust(x_bit_length, '0')
    y_str = binary_id[y_start:t_start].rjust(y_bit_length, '0')
    t_str = binary_id[t_start:t_start + t_bit_length].rjust(t_bit_length, '0')

    # デコード（数値化）
    adjusted_f_val = int(f_str, 2)
    adjusted_x_val = int(x_str, 2)
    adjusted_y_val = int(y_str, 2)
    adjusted_t_val = int(t_str, 2)

    return f_bit_length, x_bit_length, y_bit_length, t_bit_length, adjusted_f_val, adjusted_x_val, adjusted_y_val, adjusted_t_val


    
# inverse_original_infoの補助：座標
def inverse_position_spatial_id(f_header,x_header,y_header, f, x, y):
    n_h = 2**f_header
    n_x = 2**x_header
    n_y = 2**y_header
    H = 33554432  # 標高の基準（グローバルな高さの範囲）
    
    # h の逆算: 区間の中央値
    h_est = (f) * H / n_h

    # lng の逆算: x インデックスから経度の中央値
    lng_est = x* 360.0 / n_x - 180.0

    # lat の逆算: Webメルカトルの場合
    # y_tile の中心に対応する経緯度
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n_y)))
    lat_est = math.degrees(lat_rad)

    return h_est, lng_est, lat_est

# inverse_original_infoの補助：時間
def inverse_time_spatial_id(t_header, t):
    n_t = 2**t_header
    U = 2147483648
    unix_time_est = t*(U/n_t)
    
    # ISO形式に変換（UTC）
    time_est = datetime.utcfromtimestamp(unix_time_est).replace(tzinfo=timezone.utc)
    time_str = time_est.strftime("%Y-%m-%dT%H:%M:%SZ")
    return time_str

# 空間IDからもとデータへの逆算
def inverse_original_info(f_header,x_header,y_header,t_header,f,x,y,t):
    height,longtitude,latitude = inverse_position_spatial_id(f_header,x_header,y_header, f, x, y)
    time = inverse_time_spatial_id(t_header, t)
    return height,longtitude,latitude,time