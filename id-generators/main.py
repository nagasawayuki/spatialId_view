from calculate_spatial_id import (
    calculate_position_spatial_id,
    calculate_time_spatial_id,
    spatial_id_to_binary,
    binary_to_spatial_id,
    inverse_original_info
)
139.93745032552573, 37.524004043618646, 1001
#もとデータ
zoomLv = 20
height = 1001
longtitude = 139.93745032552573
latitude = 37.524004043618646
i_time = 3600 #ボクセルの時間幅
time = "2025-03-2T00:10:00Z"

#空間ID
f,x,y = calculate_position_spatial_id(zoomLv,height,longtitude,latitude)
t = calculate_time_spatial_id(i_time,time)
print(f"{zoomLv}/{f}/{x}/{y}_{i_time}/{t}")

#バイナリ空間ID
binaryId = spatial_id_to_binary(zoomLv,f,x,y,i_time,t)
print(binaryId) 
results = binary_to_spatial_id(binaryId)

#もとデータの復元
binary_id = "10100/10000/10000/00000000000000011111/11100011100000101101/01100011001011001011/111000010000/1110110000011111000"

#binary_id = "10100/10100/10100/111000010000/00000000000000000001/11100010001000100010/01100110010000111001/1110101111010100000"
#binary_id = "10100/10100/10100/111000010000/00000000000000000010/11100010001000100010/01100110010000111001/1110101111010100000"
#binary_id = "10100/10100/10100/111000010000/00000000000000000001/11100010001000100011/01100110010000111001/1110101111010100000"
#binary_id = "10100/10100/10100/111000010000/00000000000000000001/11100010001000100010/01100110010000111010/1110101111010100000"
#binary_id = "10100/10100/10100/10011/111100/1110001000100010001000100010001/110011001000011100100010001101/1110110000101000101"

results = binary_to_spatial_id(binary_id)
f_bit_length, x_bit_length, y_bit_length, f, x, y, i, t = results
print(f"{f_bit_length}/{x_bit_length}/{y_bit_length}/{f}/{x}/{y}_{i_time}/{t}")

height,longtitude,latitude,time=inverse_original_info(f_bit_length,x_bit_length,y_bit_length,f,x,y,i,t)
print("【逆算結果】")
print("推定 標高 (h):", height)
print("推定 経度 (lng):", longtitude)
print("推定 緯度 (lat):", latitude)
print("推定 時刻:", time)
    