import viewer from "./viewer.js";
import { fileInput, infoPanel, searchInput, searchBtn } from "./ui.js";
import { setupSearch, setupFileInput } from "./csvProcessor.js";

setupSearch(viewer, infoPanel, searchInput, searchBtn);
setupFileInput(viewer, fileInput);
