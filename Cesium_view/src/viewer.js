import { CESIUM_ACCESS_TOKEN } from "./config.js";
Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;
const viewer = new Cesium.Viewer("cesiumContainer", {
  timeline: true,
  animation: true
});
viewer.scene.globe.show = true;
viewer.scene.skyBox.show = true;
viewer.scene.skyAtmosphere.show = true;
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(139.93745032552573, 37.524004043618646, 1001)
});
export default viewer;
