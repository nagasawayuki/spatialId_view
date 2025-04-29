from bst_id.encoder import BSTIDEncoder
from bst_id.decoder import BSTIDDecoder
from datetime import datetime, timezone

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

zoom_x, zoom_y, zoom_f, zoom_t = 21, 21, 21,21

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

