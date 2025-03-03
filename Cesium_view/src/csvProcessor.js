import { binaryToSpatialId, inverseOriginalInfo, parseFullBinaryID, straight_binaryToSpatialId } from "./calculate_spatial.js";
import { computeAxisBounds } from "./utils.js";

function setupSearch(viewer, infoPanel, searchInput, searchBtn) {
  searchBtn.addEventListener("click", () => {
    const binaryID = searchInput.value.trim();
    if (!binaryID) { alert("binaryIDを入力してください。"); return; }
    try {
      const decoded = binaryToSpatialId(binaryID);
      let originalInfo;
      if (decoded.length === 6) {
        const [z, f, x, y, i, t] = decoded;
        originalInfo = inverseOriginalInfo(z, z, z, f, x, y, i, t);
      } else {
        const [f_header, x_header, y_header, f_val, x_val, y_val, i_val, t_val] = decoded;
        originalInfo = inverseOriginalInfo(f_header, x_header, y_header, f_val, x_val, y_val, i_val, t_val);
      }
      const center = { lng: originalInfo.longitude, lat: originalInfo.latitude, height: originalInfo.height };
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center.longitude, center.lat, center.height + 5),
        duration: 1.5
      });
      infoPanel.innerHTML = `
        <strong>Original Data:</strong><br>
        Height: ${originalInfo.height.toFixed(2)} m<br>
        Longitude: ${originalInfo.longitude.toFixed(6)}°<br>
        Latitude: ${originalInfo.latitude.toFixed(6)}°<br>
        Time: ${originalInfo.time}<br>
        BinaryID: ${binaryID}
      `;
    } catch (err) {
      console.error("binaryID の解析に失敗しました:", err);
      alert("入力された binaryID の形式が正しくありません。");
    }
  });
}

function setupFileInput(viewer, fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length === 0) { console.error("CSVファイルが空です。"); return; }
      const headerColumns = lines[0].split(',').map(s => s.trim());
      const binaryIdIndex = headerColumns.findIndex(col => col.toLowerCase() === "binaryid");
      if (binaryIdIndex === -1) {
        console.error("CSVヘッダーに 'binaryId' 列が見つかりません。");
        alert("CSVヘッダーに 'binaryId' 列が見つかりません。");
        return;
      }
      console.log("CSV読み込み完了。データ行数: " + (lines.length - 1));
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const columns = line.split(',').map(s => s.trim());
        const originalBinaryID = columns[binaryIdIndex];
        try {
          console.log("Processing row", i, ":", originalBinaryID);
          const decoded = binaryToSpatialId(originalBinaryID);
          const [f_header, x_header, y_header, f_val, x_val, y_val, i_val2, t_val2] = decoded;
          const originalInfo = inverseOriginalInfo(f_header, x_header, y_header, f_val, x_val, y_val, i_val2, t_val2);
          console.log("decode:", decoded);
          console.log("もとデータ", originalInfo);
          const parts = parseFullBinaryID(originalBinaryID);
          const fBounds = computeAxisBounds(parts.f_str, parts.header_f);
          const xBounds = computeAxisBounds(parts.x_str, parts.header_x);
          const yBounds = computeAxisBounds(parts.y_str, parts.header_y);
          const headerF = parts.header_f;
          const vertexBinaryIDs = [];
          const vertexCoordinates = [];
          const check = [];
          const decodeArr = [];
          for (let fFlag = 0; fFlag < 2; fFlag++) {
            for (let xFlag = 0; xFlag < 2; xFlag++) {
              for (let yFlag = 0; yFlag < 2; yFlag++) {
                const f_bin = (fFlag === 0) ? fBounds.lower : fBounds.upper;
                const x_bin = (xFlag === 0) ? xBounds.lower : xBounds.upper;
                const y_bin = (yFlag === 0) ? yBounds.lower : yBounds.upper;
                const vertexID = `${headerF}/${parts.header_x}/${parts.header_y}/${f_bin}/${x_bin}/${y_bin}/${parts.header_i}/${parts.t_str}`;
                vertexBinaryIDs.push(vertexID);
                const decodedVertex = straight_binaryToSpatialId(vertexID);
                decodeArr.push(decodedVertex);
                const [fBit, xBit, yBit, vf, vx, vy, vi, vt] = decodedVertex;
                const vertexInfo = inverseOriginalInfo(fBit, xBit, yBit, vf, vx, vy, vi, vt);
                check.push(vertexInfo);
                const coord = Cesium.Cartesian3.fromDegrees(vertexInfo.longitude, vertexInfo.latitude, vertexInfo.height);
                vertexCoordinates.push(coord);
              }
            }
          }
          console.log("生成された8頂点のbinaryID:", vertexBinaryIDs);
          console.log("decodedVertex:", decodeArr);
          console.log("vertexInfo: ", check);
          console.log("coord", vertexCoordinates);
          const faceColor = Cesium.Color.fromCssColorString("#FF6666").withAlpha(0.5);
          viewer.entities.add({
            id: `face_bottom_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([vertexCoordinates[0], vertexCoordinates[2], vertexCoordinates[3], vertexCoordinates[1]]),
              material: faceColor,
              perPositionHeight: true
            },
            originalBinaryID,
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromIso8601(check[0].time),
                stop: Cesium.JulianDate.fromIso8601(check[0].time_end)
              })
            ])
          });
          viewer.entities.add({
            id: `face_top_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([vertexCoordinates[4], vertexCoordinates[5], vertexCoordinates[7], vertexCoordinates[6]]),
              material: faceColor,
              perPositionHeight: true
            },
            originalBinaryID,
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromIso8601(check[0].time),
                stop: Cesium.JulianDate.fromIso8601(check[0].time_end)
              })
            ])
          });
          viewer.entities.add({
            id: `face_north_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([vertexCoordinates[0], vertexCoordinates[2], vertexCoordinates[6], vertexCoordinates[4]]),
              material: faceColor,
              perPositionHeight: true
            },
            originalBinaryID,
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromIso8601(check[0].time),
                stop: Cesium.JulianDate.fromIso8601(check[0].time_end)
              })
            ])
          });
          viewer.entities.add({
            id: `face_south_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([vertexCoordinates[1], vertexCoordinates[3], vertexCoordinates[7], vertexCoordinates[5]]),
              material: faceColor,
              perPositionHeight: true
            },
            originalBinaryID,
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromIso8601(check[0].time),
                stop: Cesium.JulianDate.fromIso8601(check[0].time_end)
              })
            ])
          });
          viewer.entities.add({
            id: `face_west_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([vertexCoordinates[0], vertexCoordinates[1], vertexCoordinates[5], vertexCoordinates[4]]),
              material: faceColor,
              perPositionHeight: true
            },
            originalBinaryID,
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromIso8601(check[0].time),
                stop: Cesium.JulianDate.fromIso8601(check[0].time_end)
              })
            ])
          });
          viewer.entities.add({
            id: `face_east_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([vertexCoordinates[2], vertexCoordinates[3], vertexCoordinates[7], vertexCoordinates[6]]),
              material: faceColor,
              perPositionHeight: true
            },
            originalBinaryID,
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromIso8601(check[0].time),
                stop: Cesium.JulianDate.fromIso8601(check[0].time_end)
              })
            ])
          });
          let camera_height = check[4].height + 10;
          const camera_position = Cesium.Cartesian3.fromDegrees(check[0].longitude, check[0].latitude, camera_height);
          viewer.camera.flyTo({ destination: camera_position, duration: 1.5 });
        } catch (err) {
          console.error("行 " + i + " の処理でエラー:", err);
        }
      }
    };
    reader.readAsText(file);
  });
}

export { setupSearch, setupFileInput };
