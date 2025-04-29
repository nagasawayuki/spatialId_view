# Cesium_view/

## 🎯 Purpose of BST-ID

- Enable **efficient spatiotemporal data management** under bandwidth constraints (e.g., LPWAN, LoRa).
- Provide **compact ID representation** for edge devices (memory-saving and communication-efficient).
- Allow **per-axis flexible resolution control** for semantic adaptability.
- Achieve **fast prefix-based filtering and searching**.
- Support **real-time, decentralized sensing and routing**.
- Facilitate **multi-hop communication** in drone swarms or sensor networks.
- Enable integration with **blockchain** and **Lightning Network** micropayment systems:
  - Each BST-ID acts as a **hash-stable, time-scoped transaction reference**.
- Offer **native 4D (x, y, h, t) encoding** in a compact, binary-optimized format.

---

## 🛠 BST-ID Specifications

- Encodes 4D coordinates (x, y, h, t) in a variable-length binary format.
- Each axis (X, Y, H, T) has independently adjustable resolution (Zoom Level).
- Structure consists of:
  - A binary header indicating the presence and resolution of each axis.
  - Variable-length coordinate data for each axis (up to 32 bits).
- For each axis:
  - 5 bits for Zoom Level (1–32 levels).
  - Binary coordinate of length equal to Zoom Level.
- X and Y axes use Web Mercator coordinates (X ∈ [-180, 180], Y ∈ [-85.0511, 85.0511]).
- H axis (Altitude) is centered at 16,384 meters (range [0, 32,768] meters).
- T axis (Time) uses 32-bit Unix Time with optional bit truncation for granularity control.
- Average binary size is about **13 bytes** (optimized for LPWAN transmission like LoRa).
- Supports **prefix filtering** at the bit level.
- Enables **partial-dimension prefix queries** (e.g., XY-only, T-only).
- Data formats supported:
  - Raw bit arrays
  - Byte arrays
  - Base64 strings
  - Integer lists ([Zoom Level, Coordinate Value] pairs)
- Implemented efficiently in Python using bitwise operations, suitable for edge devices.

## Example of BST-ID

- Flag_XYFT(4bit) + Header_XYFT(5bit * 4) + Coordinate(variable length)
- Example of BST-ID

```bash
encode_id = 317321574316540700185137299390788
bin(encode_id) = 0b111110100101001010010100111000111000001011011011000110010110010101100001111100111100001011010000000101000100

Flag_XYFT = 1111
Header_X = 10100
Header_Y = 10100
Header_F = 10100
Header_T = 10100
Coordinate_X = 111000111000001011011
Coordinate_Y = 011000110010110010101
Coordinate_F = 100001111100111100001
Coordinate_T = 011010000000101000100

bit_len = 108
decode_x = 139.93749618530273
decode_y = 37.524294652134046
decode_f = 999.9934110610047
decode_t = 1745494016
decode_t = 2025-04-24T11:26:56Z
```


## 　ZoomLv and range of inclusions
<table border="1">
  <tr>
    <th align="right">Header</th>
    <th align="right">ZoomLv</th>
    <th align="right">Coor_len</th>
    <th align="right">X_range(m)</th>
    <th align="right">Y_range(m)</th>
    <th align="right">H_range(m)</th>
    <th align="right">T_range(s)</th>
  </tr>
  <tr><td align="right">00000 (=0)</td><td align="right">1</td><td align="right">1</td><td align="right">19980000.0</td><td align="right">9440670.0</td><td align="right">16383.5</td><td align="right">2147483648</td></tr>
  <tr><td align="right">00001 (=1)</td><td align="right">2</td><td align="right">2</td><td align="right">9990000.0</td><td align="right">4720335.0</td><td align="right">8191.75</td><td align="right">1073741824</td></tr>
  <tr><td align="right">00010 (=2)</td><td align="right">3</td><td align="right">3</td><td align="right">4995000.0</td><td align="right">2360167.5</td><td align="right">4095.875</td><td align="right">536870912</td></tr>
  <tr><td align="right">00011 (=3)</td><td align="right">4</td><td align="right">4</td><td align="right">2497500.0</td><td align="right">1180083.75</td><td align="right">2047.9375</td><td align="right">268435456</td></tr>
  <tr><td align="right">00100 (=4)</td><td align="right">5</td><td align="right">5</td><td align="right">1248750.0</td><td align="right">590041.875</td><td align="right">1023.96875</td><td align="right">134217728</td></tr>
  <tr><td align="right">00101 (=5)</td><td align="right">6</td><td align="right">6</td><td align="right">624375.0</td><td align="right">295020.9375</td><td align="right">511.984375</td><td align="right">67108864</td></tr>
  <tr><td align="right">00110 (=6)</td><td align="right">7</td><td align="right">7</td><td align="right">312187.5</td><td align="right">147510.4688</td><td align="right">255.9921875</td><td align="right">33554432</td></tr>
  <tr><td align="right">00111 (=7)</td><td align="right">8</td><td align="right">8</td><td align="right">156093.75</td><td align="right">73755.2344</td><td align="right">127.9960938</td><td align="right">16777216</td></tr>
  <tr><td align="right">01000 (=8)</td><td align="right">9</td><td align="right">9</td><td align="right">78046.875</td><td align="right">36877.6172</td><td align="right">63.9980469</td><td align="right">8388608</td></tr>
  <tr><td align="right">01001 (=9)</td><td align="right">10</td><td align="right">10</td><td align="right">39023.4375</td><td align="right">18438.8086</td><td align="right">31.9990234</td><td align="right">4194304</td></tr>
  <tr><td align="right">01010 (=10)</td><td align="right">11</td><td align="right">11</td><td align="right">19511.7188</td><td align="right">9219.4043</td><td align="right">15.9995117</td><td align="right">2097152</td></tr>
  <tr><td align="right">01011 (=11)</td><td align="right">12</td><td align="right">12</td><td align="right">9755.8594</td><td align="right">4609.7021</td><td align="right">7.9997559</td><td align="right">1048576</td></tr>
  <tr><td align="right">01100 (=12)</td><td align="right">13</td><td align="right">13</td><td align="right">4877.9297</td><td align="right">2304.8511</td><td align="right">3.9998779</td><td align="right">524288</td></tr>
  <tr><td align="right">01101 (=13)</td><td align="right">14</td><td align="right">14</td><td align="right">2438.9648</td><td align="right">1152.4255</td><td align="right">1.9999389</td><td align="right">262144</td></tr>
  <tr><td align="right">01110 (=14)</td><td align="right">15</td><td align="right">15</td><td align="right">1219.4824</td><td align="right">576.2128</td><td align="right">0.9999695</td><td align="right">131072</td></tr>
  <tr><td align="right">01111 (=15)</td><td align="right">16</td><td align="right">16</td><td align="right">609.7412</td><td align="right">288.1064</td><td align="right">0.4999847</td><td align="right">65536</td></tr>
  <tr><td align="right">10000 (=16)</td><td align="right">17</td><td align="right">17</td><td align="right">304.8706</td><td align="right">144.0532</td><td align="right">0.2499924</td><td align="right">32768</td></tr>
  <tr><td align="right">10001 (=17)</td><td align="right">18</td><td align="right">18</td><td align="right">152.4353</td><td align="right">72.0266</td><td align="right">0.1249962</td><td align="right">16384</td></tr>
  <tr><td align="right">10010 (=18)</td><td align="right">19</td><td align="right">19</td><td align="right">76.2177</td><td align="right">36.0133</td><td align="right">0.0624981</td><td align="right">8192</td></tr>
  <tr><td align="right">10011 (=19)</td><td align="right">20</td><td align="right">20</td><td align="right">38.1088</td><td align="right">18.0067</td><td align="right">0.0312490</td><td align="right">4096</td></tr>
  <tr><td align="right">10100 (=20)</td><td align="right">21</td><td align="right">21</td><td align="right">19.0544</td><td align="right">9.0033</td><td align="right">0.0156245</td><td align="right">2048</td></tr>
  <tr><td align="right">10101 (=21)</td><td align="right">22</td><td align="right">22</td><td align="right">9.5272</td><td align="right">4.5016</td><td align="right">0.0078123</td><td align="right">1024</td></tr>
  <tr><td align="right">10110 (=22)</td><td align="right">23</td><td align="right">23</td><td align="right">4.7636</td><td align="right">2.2508</td><td align="right">0.0039061</td><td align="right">512</td></tr>
  <tr><td align="right">10111 (=23)</td><td align="right">24</td><td align="right">24</td><td align="right">2.3818</td><td align="right">1.1254</td><td align="right">0.0019531</td><td align="right">256</td></tr>
  <tr><td align="right">11000 (=24)</td><td align="right">25</td><td align="right">25</td><td align="right">1.1909</td><td align="right">0.5627</td><td align="right">0.0009765</td><td align="right">128</td></tr>
  <tr><td align="right">11001 (=25)</td><td align="right">26</td><td align="right">26</td><td align="right">0.5955</td><td align="right">0.2813</td><td align="right">0.0004883</td><td align="right">64</td></tr>
  <tr><td align="right">11010 (=26)</td><td align="right">27</td><td align="right">27</td><td align="right">0.2978</td><td align="right">0.1407</td><td align="right">0.0002441</td><td align="right">32</td></tr>
  <tr><td align="right">11011 (=27)</td><td align="right">28</td><td align="right">28</td><td align="right">0.1489</td><td align="right">0.0703</td><td align="right">0.0001221</td><td align="right">16</td></tr>
  <tr><td align="right">11100 (=28)</td><td align="right">29</td><td align="right">29</td><td align="right">0.0744</td><td align="right">0.0352</td><td align="right">0.0000610</td><td align="right">8</td></tr>
  <tr><td align="right">11101 (=29)</td><td align="right">30</td><td align="right">30</td><td align="right">0.0372</td><td align="right">0.0176</td><td align="right">0.0000305</td><td align="right">4</td></tr>
  <tr><td align="right">11110 (=30)</td><td align="right">31</td><td align="right">31</td><td align="right">0.0186</td><td align="right">0.0088</td><td align="right">0.0000153</td><td align="right">2</td></tr>
  <tr><td align="right">11111 (=31)</td><td align="right">32</td><td align="right">32</td><td align="right">0.0093</td><td align="right">0.0044</td><td align="right">0.0000076</td><td align="right">1</td></tr>
</table>


## ファイル構成

    Cesiumview/
    ├── index.html                // エントリーポイント（HTML）
    └── src/
        ├── config.js             // Cesium のアクセストークン設定
        ├── calculate_spatial.js  // spatial ID の計算・変換関数群
        ├── viewer.js             // Cesium Viewer の初期化
        ├── ui.js                 // ファイル選択、情報表示、検索パネルの生成
        ├── utils.js              // 補助関数（computeAxisBounds）
        ├── csvProcessor.js       // CSV 読込、解析、エンティティ描画、検索処理
        └── app.js                // 各モジュールの初期化

    BST_ID/
    ├──  bst_id/
    │   ├── __init__.py                // Cesium のアクセストークン設定
    │   ├── constants.py               // 定数定義ファイル
    │   ├── decoder.py                 // デコードクラス
    │   ├── encoder_tile_calculator.py //　エンコード計算機
    │   └── encoder.py                 // エンコードクラス
    │
    └── tests/
        ├── __init__.py                   // testsパッケージの初期化ファイル
        └── test_decoder_and_encoder.py   // エンコードした値をデコードする



## Prepare installs

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   ```bash
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install the Node.js package for the local server:
   ```bash
   npm install -g http-server
   ```


## How to use
1. Start Cesium
   ```bash
   npx http-server
   ```
2. Open browser

   http://127.0.0.1:8080

3. Click on Cesium _view/src

4. Click on "Select file" at the top left of the screen and select the csv file containing the BST-ID.
