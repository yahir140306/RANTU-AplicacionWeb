const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/cuarto/[id].astro');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import ImageGallery from")) {
    content = content.replace('import DownloadCard from "../../components/DownloadCard.astro";', 'import DownloadCard from "../../components/DownloadCard.astro";\nimport ImageGallery from "../../components/ImageGallery.astro";');
}

// Extracting Modal to Carrusel
const galleryRegex = /<!-- Modal para zoom de imagen \(Galería\) -->[\s\S]*?<\/div>\s*<!-- Descripción -->/g;
content = content.replace(galleryRegex, '<ImageGallery imagenes={imagenes} />\n\n        <!-- Descripción -->');

// Extracting Galeria Script
const galleryScriptRegex = /\/\/ === LOGICA DE LA GALERIA ===[\s\S]*?(?=\/\/ === LOGICA DEL MAPA ===)/g;
content = content.replace(galleryScriptRegex, '');

fs.writeFileSync(filePath, content);
console.log("Refactor 2 applied completely!");
