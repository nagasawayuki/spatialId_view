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
  
  function spatialIdToBinary(z, f, x, y, i, t) {
    const header = z.toString(2).padStart(5, '0');
    const header_f = header;
    const header_x = header;
    const header_y = header;
    const f_str = f.toString(2).padStart(z, '0');
    const x_str = x.toString(2).padStart(z, '0');
    const y_str = y.toString(2).padStart(z, '0');
    const i_bin = i.toString(2);
    const t_str = t.toString(2);
    return `${header_f}/${header_x}/${header_y}/${f_str}/${x_str}/${y_str}/${i_bin}/${t_str}`;
  }
  
  function parseFullBinaryID(fullID) {
    const parts = fullID.split("/");
    if (parts.length !== 8) {
      throw new Error("binaryID の形式が正しくありません。");
    }
    const header_f = parts[0];
    const header_x = parts[1];
    const header_y = parts[2];
    const f_str = parts[3].slice(0, parseInt(header_f, 2)).padStart(20, '0');
    const x_str = parts[4].slice(0, parseInt(header_x, 2)).padStart(20, '0');
    const y_str = parts[5].slice(0, parseInt(header_y, 2)).padStart(20, '0');
    const header_i = parts[6];
    const t_str = parts[7];
    return { header_f, header_x, header_y, f_str, x_str, y_str, header_i, t_str };
  }
  
  function binaryToSpatialId(binary_id) {
    const parts = binary_id.split('/');
    if (parts.length !== 8) {
      throw new Error("バイナリIDの形式が不正です。");
    }
    const [header_f, header_x, header_y, f_str, x_str, y_str, i_bin, t_str] = parts;
    const f_bit_length = parseInt(header_f, 2);
    const x_bit_length = parseInt(header_x, 2);
    const y_bit_length = parseInt(header_y, 2);
    let adjusted_f_val = f_str.slice(0, f_bit_length).padStart(20, '0');
    let adjusted_x_val = x_str.slice(0, x_bit_length).padStart(20, '0');
    let adjusted_y_val = y_str.slice(0, y_bit_length).padStart(20, '0');
    adjusted_f_val = parseInt(adjusted_f_val, 2);
    adjusted_x_val = parseInt(adjusted_x_val, 2);
    adjusted_y_val = parseInt(adjusted_y_val, 2);
    const i_val = parseInt(i_bin, 2);
    const t_val = parseInt(t_str, 2);
    return [f_bit_length, x_bit_length, y_bit_length, adjusted_f_val, adjusted_x_val, adjusted_y_val, i_val, t_val];
  }
  
  function straight_binaryToSpatialId(binary_id){
    const parts = binary_id.split('/');
    if (parts.length !== 8) {
      throw new Error("バイナリIDの形式が不正です。");
    }
    const [header_f, header_x, header_y, f_str, x_str, y_str, i_bin, t_str] = parts;
    const f_bit_length = parseInt(header_f, 2);
    const x_bit_length = parseInt(header_x, 2);
    const y_bit_length = parseInt(header_y, 2);
    const f_val = parseInt(f_str, 2);
    const x_val = parseInt(x_str, 2);
    const y_val = parseInt(y_str, 2);
    const i_val = parseInt(i_bin, 2);
    const t_val = parseInt(t_str, 2);
    return [f_bit_length, x_bit_length, y_bit_length, f_val, x_val, y_val, i_val, t_val];
  }
  
  function inversePositionSpatialId(fHeader, xHeader, yHeader, f, x, y) {
    const n_h = Math.pow(2, fHeader);
    const n_x = Math.pow(2, xHeader);
    const n_y = Math.pow(2, yHeader);
    const H = 33554432;
    const h_est = f * H / n_h;
    const lng_est = x * 360 / n_x - 180;
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n_y)));
    const lat_est = lat_rad * 180 / Math.PI;
    return [h_est, lng_est, lat_est];
  }
  
  function inverseTimeSpatialId(i, t) {
    let unix_time_est = t * i;
    const date = new Date(unix_time_est * 1000);
    return date.toISOString().replace('.000', '');
  }
  
  function inverseOriginalInfo(fHeader, xHeader, yHeader, f, x, y, i, t) {
    const [h_est, lng_est, lat_est] = inversePositionSpatialId(fHeader, xHeader, yHeader, f, x, y);
    const timeStr = inverseTimeSpatialId(i, t);
    const time_end = inverseTimeSpatialId(i,t+1);
    return { height: h_est, longitude: lng_est, latitude: lat_est, time: timeStr, time_end:time_end };
  }
  
  export {
    calculatePositionSpatialId,
    unixConverter,
    calculateTimeSpatialId,
    spatialIdToBinary,
    binaryToSpatialId,
    inversePositionSpatialId,
    inverseTimeSpatialId,
    inverseOriginalInfo,
    parseFullBinaryID,
    straight_binaryToSpatialId
  };
  