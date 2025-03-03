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
def calculate_time_spatial_id(i, time):
    time = unix_converter(time)
    t = math.floor(time/i)
    return t  

# 空間IDからバイナリ空間IDを生成する関数。各値はヘッダー5bit,ボディ20bitで固定。検索の時とかにヘッダーを変えて参照範囲を決めさせる
def spatial_id_to_binary(z,f, x, y, i,t):
    # ヘッダーは各軸の必要ビット数を5ビット固定のバイナリ文字列にする
    header_f = format(z, '05b')
    header_x = format(z, '05b')
    header_y = format(z, '05b')
    
    # 各インデックスをz桁のバイナリでゼロパディング
    f_str = format(f, f'0{z}b')
    x_str = format(x, f'0{z}b')
    y_str = format(y, f'0{z}b')
    i = format(i, 'b')
    t_str = format(t, 'b') #有効期限：2106-02-07 06:28:15
    id = f"{header_f}/{header_x}/{header_y}/{f_str}/{x_str}/{y_str}/{i}/{t_str}"
    return id

# バイナリ空間IDから空間IDを復元する関数
def binary_to_spatial_id(binary_id):
    
    parts = binary_id.split('/')
    if len(parts) != 8:
        raise ValueError("バイナリIDの形式が不正です。")
    
    header_f, header_x, header_y, f_str, x_str, y_str, i_bin ,t_str = parts

    # ヘッダーから各軸のズームレベルを取得（すべて同じ値であることを前提）
    f_bit_length = int(header_f, 2)
    x_bit_length = int(header_x, 2)
    y_bit_length = int(header_y, 2)
    

    # ヘッダーの値に基づき、各フィールド文字列の左側から指定ビット数分を抽出して数値に変換
    f_val = int(f_str[:f_bit_length], 2) if len(f_str) >= f_bit_length else 0
    x_val = int(x_str[:x_bit_length], 2) if len(x_str) >= x_bit_length else 0
    y_val = int(y_str[:y_bit_length], 2) if len(y_str) >= y_bit_length else 0

    # i_bin と t_str はそのまま2進数文字列から整数に変換
    i_val = int(i_bin, 2)
    t_val = int(t_str, 2)

    
    return f_bit_length, x_bit_length, y_bit_length, f_val, x_val, y_val, i_val, t_val

    
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
def inverse_time_spatial_id(i, t):
    # 推定Unix時刻
    print(f"i: {i}, t: {t}")
    unix_time_est = t * i
    # ISO形式に変換（UTC）
    time_est = datetime.utcfromtimestamp(unix_time_est).replace(tzinfo=timezone.utc)
    time_str = time_est.strftime("%Y-%m-%dT%H:%M:%SZ")
    return time_str

# 空間IDからもとデータへの逆算
def inverse_original_info(f_header,x_header,y_header,f,x,y,i,t):
    height,longtitude,latitude = inverse_position_spatial_id(f_header,x_header,y_header, f, x, y)
    time = inverse_time_spatial_id(i, t)
    return height,longtitude,latitude,time


if __name__ == '__main__':
    f = 60
    x = 1896943889
    y = 857852045
    i = 3600
    t = 482976
    binary_id = spatial_id_to_binary(f, x, y, i,t)
    print(binary_id)
