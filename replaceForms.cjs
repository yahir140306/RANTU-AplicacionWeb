const fs = require('fs');
const path = require('path');

const addPath = path.join(__dirname, 'src/pages/agregar-cuarto.astro');
const editPath = path.join(__dirname, 'src/pages/editar-cuarto/[id].astro');

// ADD FORM
let addContent = fs.readFileSync(addPath, 'utf8');
// Import
if (!addContent.includes('import RoomForm')) {
    addContent = addContent.replace('import Layout from "../layouts/Layout.astro";', 'import Layout from "../layouts/Layout.astro";\nimport RoomForm from "../components/RoomForm.astro";');
}
const addFormRegex = /<form[\s\S]*?id="room-form"[\s\S]*?>[\s\S]*?<\/form>/;
addContent = addContent.replace(addFormRegex, '<RoomForm mode="add" />');
fs.writeFileSync(addPath, addContent);

// EDIT FORM
let editContent = fs.readFileSync(editPath, 'utf8');
// Import
if (!editContent.includes('import RoomForm')) {
    editContent = editContent.replace('import Layout from "../../layouts/Layout.astro";', 'import Layout from "../../layouts/Layout.astro";\nimport RoomForm from "../../components/RoomForm.astro";');
}
const editFormRegex = /<form[\s\S]*?id="edit-room-form"[\s\S]*?>[\s\S]*?<\/form>/;
editContent = editContent.replace(editFormRegex, '<RoomForm mode="edit" cuarto={cuarto} />');
fs.writeFileSync(editPath, editContent);

console.log("Forms replaced in pages!");
