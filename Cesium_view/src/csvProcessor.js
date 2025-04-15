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
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length === 0) {
        console.error("CSVファイルが空です。");
        return;
      }
      // 1行目をヘッダーとして、binaryId 列のインデックスを取得（大文字小文字を区別しない）
      const headerColumns = lines[0].split(',').map(s => s.trim());
      const binaryIdIndex = headerColumns.findIndex(col => col.toLowerCase() === "binaryid");
      if (binaryIdIndex === -1) {
        console.error("CSVヘッダーに 'binaryId' 列が見つかりません。");
        alert("CSVヘッダーに 'binaryId' 列が見つかりません。");
        return;
      }
      console.log("CSV読み込み完了。データ行数: " + (lines.length - 1));

      // CSVの各行について処理
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const columns = line.split(',').map(s => s.trim());
        const originalBinaryID = columns[binaryIdIndex];
        try {
          console.log("Processing row", i, ":", originalBinaryID);

          // binaryID から全体の元データ復元（参考情報）
          const decoded = binaryToSpatialId(originalBinaryID);
          let originalInfo, z, f, x, y, i_val, t_val;
          const [f_header, x_header, y_header, t_header, f_val, x_val, y_val, t_val2] = decoded;
          originalInfo = inverseOriginalInfo(f_header, x_header, y_header, t_header, f_val, x_val, y_val, t_val2);
          console.log("decode:", decoded)
          console.log("i: e", t_header, t_val2)
          console.log("もとデータ", originalInfo);


          // parseFullBinaryID を使い、元の2進数文字列パーツを取得
          const parts = parseFullBinaryID(originalBinaryID);
          console.log("f_str length:", parts.f_str.length, "expected:", parts.header_f);
          console.log("x_str length:", parts.x_str.length, "expected:", parts.header_x);
          console.log("y_str length:", parts.y_str.length, "expected:", parts.header_y);

          // 各軸の下限・上限の2進数文字列を取得
          const fBounds = computeAxisBounds(parts.f_str, parts.header_f);
          const xBounds = computeAxisBounds(parts.x_str, parts.header_x);
          const yBounds = computeAxisBounds(parts.y_str, parts.header_y);
          // ここでは、時間は parts.header_t (時間幅) と parts.t_str (時間インデックス) をそのまま利用
          // ヘッダー部分
          const headerF = parts.header_f;
          const headerX = parts.header_x;
          const headerY = parts.header_y;
          const headerT = parts.header_t;

          // ズームレベルは、calculate_spatial.js では同一値前提なので各軸のヘッダーから数値に変換
          const xZoom = parseInt(headerX, 2);
          const yZoom = parseInt(headerY, 2);
          const zZoom = parseInt(headerF, 2);

          // binaryIDに＋１する場所を変更すればうまくいく！！！
          // 8頂点のバイナリIDと座標を生成
          const vertexBinaryIDs = [];
          const print_vertexBinaryIDs = [];
          const vertexCoordinates = [];
          const check = []
          const decode = []
          for (let fFlag = 0; fFlag < 2; fFlag++) {
            for (let xFlag = 0; xFlag < 2; xFlag++) {
              for (let yFlag = 0; yFlag < 2; yFlag++) {
                // 各軸について下限または上限の2進数文字列を選択
                const f_bin = (fFlag === 0) ? fBounds.lower : fBounds.upper;
                const x_bin = (xFlag === 0) ? xBounds.lower : xBounds.upper;
                const y_bin = (yFlag === 0) ? yBounds.lower : yBounds.upper;

                // 頂点ごとのバイナリIDを生成（元のフォーマットに合わせる）
                const vertexID = `${headerF}${headerX}${headerY}${headerT}${f_bin}${x_bin}${y_bin}${parts.t_str}`;
                const printvertxID = `${headerF}/${headerX}/${headerY}/${headerT}/${f_bin}/${x_bin}/${y_bin}/${parts.t_str}`
                vertexBinaryIDs.push(vertexID);
                print_vertexBinaryIDs.push(printvertxID)

                // binaryToSpatialId() を利用して、vertexID をデコード
                const decodedVertex = straight_binaryToSpatialId(vertexID);
                decode.push(decodedVertex)
                const [fBit, xBit, yBit, tBit, vf, vx, vy, vt] = decodedVertex;

                // inverseOriginalInfo() で各頂点の元データ（標高、経度、緯度、時間）を復元
                const vertexInfo = inverseOriginalInfo(fBit, xBit, yBit, tBit, vf, vx, vy, vt);
                check.push(vertexInfo)

                // Cesium 用の座標に変換
                const coord = Cesium.Cartesian3.fromDegrees(vertexInfo.longitude, vertexInfo.latitude, vertexInfo.height);
                vertexCoordinates.push(coord);
              }
            }
          }

          console.log("生成された8頂点のbinaryID:", print_vertexBinaryIDs);
          console.log("decodedVertex:", decode)
          console.log("vertexInfo: ", check)
          console.log("coord", vertexCoordinates)

          const obj = {
            originalBinaryID,
            vertexBinaryIDs,
            vertexCoordinates,
          };
          console.log("Row", i, "生成オブジェクト:", obj);

          // --- 描画 ---
          const faceColor = Cesium.Color.fromCssColorString("#FF6666").withAlpha(0.5);
          // ---時間 ---
          const start = Cesium.JulianDate.fromIso8601(check[0].time);
          const end = Cesium.JulianDate.addSeconds(start, check[0].t_span, new Cesium.JulianDate());//無理やり1時間にしてる。これをcheck[0].t_spanにする
          const availability = new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start,
              stop: end,
              isStartIncluded: true,
              isStopIncluded: false
            })
          ]);

          // 底面 (fL)：v0, v2, v3, v1
          viewer.entities.add({
            id: `face_bottom_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([
                vertexCoordinates[0],
                vertexCoordinates[2],
                vertexCoordinates[3],
                vertexCoordinates[1]
              ]),
              material: faceColor,
              perPositionHeight: true
            },
            availability: availability,
            originalBinaryID: originalBinaryID
          });

          // 上面 (fU)：v4, v5, v7, v6
          viewer.entities.add({
            id: `face_top_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([
                vertexCoordinates[4],
                vertexCoordinates[5],
                vertexCoordinates[7],
                vertexCoordinates[6]
              ]),
              material: faceColor,
              perPositionHeight: true
            },
            availability: availability,
            originalBinaryID: originalBinaryID
          });

          // 北面 (yL)：v0, v2, v6, v4
          viewer.entities.add({
            id: `face_north_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([
                vertexCoordinates[0],
                vertexCoordinates[2],
                vertexCoordinates[6],
                vertexCoordinates[4]
              ]),
              material: faceColor,
              perPositionHeight: true
            },
            availability: availability,
            originalBinaryID: originalBinaryID
          });

          // 南面 (yU)：v1, v3, v7, v5
          viewer.entities.add({
            id: `face_south_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([
                vertexCoordinates[1],
                vertexCoordinates[3],
                vertexCoordinates[7],
                vertexCoordinates[5]
              ]),
              material: faceColor,
              perPositionHeight: true
            },
            availability: availability,
            originalBinaryID: originalBinaryID
          });

          // 左面 (xL)：v0, v1, v5, v4
          viewer.entities.add({
            id: `face_west_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([
                vertexCoordinates[0],
                vertexCoordinates[1],
                vertexCoordinates[5],
                vertexCoordinates[4]
              ]),
              material: faceColor,
              perPositionHeight: true
            },
            availability: availability,
            originalBinaryID: originalBinaryID
          });

          // 右面 (xU)：v2, v3, v7, v6
          viewer.entities.add({
            id: `face_east_${i}`,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy([
                vertexCoordinates[2],
                vertexCoordinates[3],
                vertexCoordinates[7],
                vertexCoordinates[6]
              ]),
              material: faceColor,
              perPositionHeight: true
            },
            availability: availability,
            originalBinaryID: originalBinaryID
          });

          let camera_height, camera_position;
          camera_height = check[4].height + 10
          console.log("camera_height:", camera_height)
          console.log("check[0]:", check[0])
          camera_position = Cesium.Cartesian3.fromDegrees(check[0].longitude, check[0].latitude, camera_height)
          console.log("camera:", camera_position)
          // カメラを直方体の中心の標高＋5mへ移動
          viewer.camera.flyTo({
            destination: camera_position,
            duration: 1.5
          });

        } catch (err) {
          console.error("行 " + i + " の処理でエラー:", err);
        }
      }
    };
    reader.readAsText(file);
  });
}

export { setupSearch, setupFileInput };
