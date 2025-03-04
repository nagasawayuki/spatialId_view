const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".csv";
fileInput.style.position = "absolute";
fileInput.style.top = "10px";
fileInput.style.left = "10px";
fileInput.style.zIndex = "100";
document.body.appendChild(fileInput);

const infoPanel = document.createElement("div");
infoPanel.id = "infoPanel";
infoPanel.style.position = "absolute";
infoPanel.style.bottom = "10px";
infoPanel.style.left = "10px";
infoPanel.style.background = "rgba(255,255,255,0.8)";
infoPanel.style.padding = "10px";
infoPanel.style.zIndex = "150";
infoPanel.style.maxHeight = "200px";
infoPanel.style.overflowY = "auto";
document.body.appendChild(infoPanel);

const searchPanel = document.createElement("div");
searchPanel.style.position = "absolute";
searchPanel.style.top = "10px";
searchPanel.style.right = "10px";
searchPanel.style.background = "rgba(255,255,255,0.8)";
searchPanel.style.padding = "10px";
searchPanel.style.zIndex = "200";
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "binaryID を入力";
searchInput.id = "searchInput";
const searchBtn = document.createElement("button");
searchBtn.id = "searchBtn";
searchBtn.innerText = "検索";
searchPanel.appendChild(searchInput);
searchPanel.appendChild(searchBtn);
document.body.appendChild(searchPanel);

export { fileInput, infoPanel, searchInput, searchBtn };
