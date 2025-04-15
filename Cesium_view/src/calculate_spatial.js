function calculatePositionSpatialId(z, h, lng, lat) {
    const n = Math.pow(2, z);
    const H = 33554432;
    const lat_rad = lat * Math.PI / 180;
    const f = Math.floor(n * h / H);
    const x = Math.floor(n * (lng + 180) / 360);
    const y = Math.floor(n / 2 * (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI));
    return [f, x, y];
  }
  
  function unixConverter(timeStr) {
    const date = new Date(timeStr);
    return Math.floor(date.getTime() / 1000);
  }
  
  function calculateTimeSpatialId(i, timeStr) {
    const unix_time = unixConverter(timeStr);
    const t = Math.floor(unix_time / i);
    return t;
  }
  
  function parseFullBinaryID(fullID) {
    // ヘッダー部分（20ビット）
    const header_f = fullID.slice(0, 5);
    const header_x = fullID.slice(5, 10);
    const header_y = fullID.slice(10, 15);
    const header_t = fullID.slice(15, 20);
  
    const f_bit_length = parseInt(header_f, 2);
    const x_bit_length = parseInt(header_x, 2);
    const y_bit_length = parseInt(header_y, 2);
    const t_bit_length = parseInt(header_t, 2);
  
    const f_start = 20;
    const x_start = f_start + f_bit_length;
    const y_start = x_start + x_bit_length;
    const t_start = y_start + y_bit_length;
  
    const f_str = fullID.slice(f_start, x_start).padStart(f_bit_length, '0');
    const x_str = fullID.slice(x_start, y_start).padStart(x_bit_length, '0');
    const y_str = fullID.slice(y_start, t_start).padStart(y_bit_length, '0');
    const t_str = fullID.slice(t_start, t_start + t_bit_length).padStart(t_bit_length, '0');
  
    return {
      header_f,
      header_x,
      header_y,
      header_t,
      f_str,
      x_str,
      y_str,
      t_str
    };
  }
  
  function binaryToSpatialId(binary_id) {
    // 最初の20ビット = 各軸のビット長（5bit × 4軸）
    const header_f = binary_id.slice(0, 5);
    const header_x = binary_id.slice(5, 10);
    const header_y = binary_id.slice(10, 15);
    const header_t = binary_id.slice(15, 20);
  
    const f_bit_length = parseInt(header_f, 2);
    const x_bit_length = parseInt(header_x, 2);
    const y_bit_length = parseInt(header_y, 2);
    const t_bit_length = parseInt(header_t, 2);
  
    // 各軸のデータ位置を計算
    const f_start = 20;
    const x_start = f_start + f_bit_length;
    const y_start = x_start + x_bit_length;
    const t_start = y_start + y_bit_length;
  
    // 指定されたビット長で切り出す
    const f_str = binary_id.slice(f_start, x_start).padStart(f_bit_length, '0');
    const x_str = binary_id.slice(x_start, y_start).padStart(x_bit_length, '0');
    const y_str = binary_id.slice(y_start, t_start).padStart(y_bit_length, '0');
    const t_str = binary_id.slice(t_start, t_start + t_bit_length).padStart(t_bit_length, '0');
  
    // デコード（数値化）
    const adjusted_f_val = parseInt(f_str, 2);
    const adjusted_x_val = parseInt(x_str, 2);
    const adjusted_y_val = parseInt(y_str, 2);
    const adjusted_t_val = parseInt(t_str, 2);

    if (
      isNaN(f_bit_length) || isNaN(x_bit_length) || isNaN(y_bit_length) || isNaN(t_bit_length) ||
      isNaN(adjusted_f_val) || isNaN(adjusted_x_val) || isNaN(adjusted_y_val) || isNaN(adjusted_t_val)
    ) {
      throw new Error("バイナリIDからNaNが生成されました。bit長または値が不正です。");
    }

    return [
      f_bit_length,
      x_bit_length,
      y_bit_length,
      t_bit_length,
      adjusted_f_val,
      adjusted_x_val,
      adjusted_y_val,
      adjusted_t_val
    ];
  }
  
  function straight_binaryToSpatialId(binary_id){
    const header = binary_id.slice(0, 20);
    const f_bit_length = parseInt(header.slice(0, 5), 2);
    const x_bit_length = parseInt(header.slice(5, 10), 2);
    const y_bit_length = parseInt(header.slice(10, 15), 2);
    const t_bit_length = parseInt(header.slice(15, 20), 2);
  
    // 各軸の開始位置を計算
    const f_start = 20;
    const x_start = f_start + f_bit_length;
    const y_start = x_start + x_bit_length;
    const t_start = y_start + y_bit_length;
  
    // ビット列から各値を抽出
    const f_str = binary_id.slice(f_start, x_start).padStart(f_bit_length, '0');
    const x_str = binary_id.slice(x_start, y_start).padStart(x_bit_length, '0');
    const y_str = binary_id.slice(y_start, t_start).padStart(y_bit_length, '0');
    const t_str = binary_id.slice(t_start, t_start + t_bit_length).padStart(t_bit_length, '0');
 
    const f_val = parseInt(f_str, 2);
    const x_val = parseInt(x_str, 2);
    const y_val = parseInt(y_str, 2);
    const t_val = parseInt(t_str, 2);
    return [f_bit_length, x_bit_length, y_bit_length,t_bit_length,f_val, x_val, y_val, t_val];
  }
  
  function inversePositionSpatialId(fHeader, xHeader, yHeader, f, x, y) {
    const n_h = Math.pow(2, fHeader);
    const n_x = Math.pow(2, xHeader);
    const n_y = Math.pow(2, yHeader);
    const H = 33554432;
    
    // fから標高の区間の下限値（中央値近くの値）を推定
    const h_est = f * H / n_h;
    
    // xから経度の中央値を推定
    const lng_est = x * 360 / n_x - 180;
    
    // yからWebメルカトルの逆変換で緯度を推定
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n_y)));
    const lat_est = lat_rad * 180 / Math.PI;
    
    return [h_est, lng_est, lat_est];
  }
  
  // 補助関数（もとデータの逆算：時間情報をバイナリIDの時間インデックスから推定する関数）
  function inverseTimeSpatialId(tHeader, t) {
    const nT = 2 ** tHeader;
    const U = 2147483648;
    const t_span = U / nT
    const unixTimeEst = t * (U / nT);
  
    // JavaScriptではDateはミリ秒単位なので *1000
    const date = new Date(unixTimeEst * 1000);
    const isoString = date.toISOString();  // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const time = isoString.split('.')[0] + 'Z'; 

    // 秒までの形式に整形（"2025-04-11T12:34:56Z"）
    return { time, t_span };
  }
  
  // 空間IDから、元データ（標高、経度、緯度、時刻）を逆算する関数
  // fHeader, xHeader, yHeader：それぞれヘッダーから得たビット長
  function inverseOriginalInfo(fHeader, xHeader, yHeader,tHeader, f, x, y, t) {
    const [h_est, lng_est, lat_est] = inversePositionSpatialId(fHeader, xHeader, yHeader, f, x, y);
    const {time, t_span}= inverseTimeSpatialId(tHeader, t);
    return { height: h_est, longitude: lng_est, latitude: lat_est, time:time, t_span: t_span };
  }
  
  export {
    calculatePositionSpatialId,
    unixConverter,
    calculateTimeSpatialId,
    binaryToSpatialId,
    inversePositionSpatialId,
    inverseTimeSpatialId,
    inverseOriginalInfo,
    parseFullBinaryID,
    straight_binaryToSpatialId
  };
  
  