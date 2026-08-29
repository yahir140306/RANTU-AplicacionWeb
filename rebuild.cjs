const fs = require('fs');
const path = require('path');

const backupPath = '/tmp/id_backup.astro';
const targetPath = path.join(__dirname, 'src/pages/cuarto/[id].astro');

let content = fs.readFileSync(backupPath, 'utf8');

// 1. Add new imports
const importTarget = 'import Layout from "../../layouts/Layout.astro";';
const newImports = `import Layout from "../../layouts/Layout.astro";
import ImageGallery from "../../components/ImageGallery.astro";
import DownloadCard from "../../components/DownloadCard.astro";
import RoomComments from "../../components/RoomComments.astro";
import RoomMap from "../../components/RoomMap.astro";`;
content = content.replace(importTarget, newImports);

// 2. Replace Gallery
const galleryRegex = /<!-- Modal para zoom de imagen \(Galería\) -->[\s\S]*?<\/div>\s*<!-- Descripción -->/;
content = content.replace(galleryRegex, '<ImageGallery imagenes={imagenes} />\n\n        <!-- Descripción -->');

// 3. Replace Map
const mapRegex = /\{cuarto\.latitud && cuarto\.longitud \? \([\s\S]*?\}\)/;
content = content.replace(mapRegex, '<RoomMap cuarto={cuarto} />');

// 4. Replace Comments Section
const commentsRegex = /<!-- Sección de Comentarios -->[\s\S]*?<\/section>/;
content = content.replace(commentsRegex, '<!-- Sección de Comentarios -->\n        <RoomComments cuarto={cuarto} currentUserId={currentUserId} />');

// 5. Replace Download Button and Card
const downloadBtnRegex = /\{cuarto\.activo \? \([\s\S]*?id="download-btn"[\s\S]*?Descargar Tarjeta[\s\S]*?<\/button>\s*\)\s*:\s*\([\s\S]*?No Disponible[\s\S]*?<\/button>\s*\)\}/;
content = content.replace(downloadBtnRegex, '');

const hiddenCardRegex = /<!-- Tarjeta oculta para descarga -->\s*<div id="download-card" class="download-hidden">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(hiddenCardRegex, '<DownloadCard cuarto={cuarto} portadaBase64={portadaBase64} />');

// 6. Remove the giant script block
const scriptRegex = /<script is:inline define:vars=\{\{ cuarto \}\}>[\s\S]*?<\/script>/;
content = content.replace(scriptRegex, '');

// 7. Remove the other script block for modal
const modalScriptRegex = /<script is:inline>[\s\S]*?\/\/ === LOGICA DEL MODAL DE IMAGEN ===[\s\S]*?<\/script>/;
content = content.replace(modalScriptRegex, '');


fs.writeFileSync(targetPath, content);
console.log("Rebuild applied completely!");
