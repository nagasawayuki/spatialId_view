from bst_id.encoder import BSTIDEncoder
from bst_id.decoder import BSTIDDecoder
from datetime import datetime, timezone
from bst_id.logic import get_common_prefix_id,is_match, id_separate

def iso8601_to_unix_time(iso8601_str: str) -> int:
    dt = datetime.strptime(iso8601_str, "%Y-%m-%dT%H:%M:%SZ")
    dt = dt.replace(tzinfo=timezone.utc)  # UTCタイムゾーンを明示する
    return int(dt.timestamp())

def unix_time_to_iso8601(unix_time: int) -> str:
    """
    Unix Time (int型) を ISO8601形式のUTC文字列に変換する
    """
    dt = datetime.fromtimestamp(unix_time, tz=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

h = 1000
x = 139.9376599567023
y = 37.524245855943775
t = "2025-04-24T12:00:00Z"
t = iso8601_to_unix_time(t)

zoom_x, zoom_y, zoom_f, zoom_t = 3, 3, 3, 3

encoded_id, bit_len = BSTIDEncoder.encode(x, y, h, t, zoom_x, zoom_y, zoom_f, zoom_t)
print(f"encode_id = {encoded_id}")
print(f"bin(encode_id) = {bin(encoded_id)}")
print(f"bit_len = {bit_len}")

decoded_x, decoded_y, decoded_f, decoded_t = BSTIDDecoder.decode(encoded_id, bit_len)
print(f"decode_x = {decoded_x}")
print(f"decode_y = {decoded_y}")
print(f"decode_f = {decoded_f}")
print(f"decode_t = {decoded_t}")
print(f"decode_t = {unix_time_to_iso8601(decoded_t)}")

h2 = 1000
x2 = 139.9
y2 = 37.5
t2 = "2025-04-24T12:00:00Z"
t2 = iso8601_to_unix_time(t2)

zoom_x2, zoom_y2, zoom_f2, zoom_t2 = 4, 4, 4,4

encoded_id2, bit_len2 = BSTIDEncoder.encode(x2, y2, h2, t, zoom_x2, zoom_y2, zoom_f2, zoom_t2)
print(f"encode_id = {encoded_id2}")
print(f"bin(encode_id) = {bin(encoded_id2)}")
print(f"bit_len = {bit_len2}")

decoded_x2, decoded_y2, decoded_f2, decoded_t2 = BSTIDDecoder.decode(encoded_id2, bit_len2)
print(f"decode_x = {decoded_x2}")
print(f"decode_y = {decoded_y2}")
print(f"decode_f = {decoded_f2}")
print(f"decode_t = {decoded_t2}")
print(f"decode_t = {unix_time_to_iso8601(decoded_t2)}")

id_common = get_common_prefix_id(encoded_id,encoded_id2)
is_match_val = is_match(encoded_id,encoded_id2)

print(f"id_common = {id_common}")
print(f"is_match_val = {is_match_val}")

print(f"id1 = {id_separate(encoded_id)}")
print(f"id2 = {id_separate(encoded_id2)}")
print(f"id = {id_separate(id_common)}")