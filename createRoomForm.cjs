const fs = require('fs');
const path = require('path');

const addFormPath = path.join(__dirname, 'src/pages/agregar-cuarto.astro');
const content = fs.readFileSync(addFormPath, 'utf8');

// Extract the form
const formMatch = content.match(/<form[\s\S]*?id="room-form"[\s\S]*?>([\s\S]*?)<\/form>/);
if (!formMatch) {
    console.log("No form found!");
    process.exit(1);
}

let formHtml = formMatch[1];

// Make it work for Edit
// Reemplazos para pre-llenar valores si 'cuarto' existe
const fieldsToValue = ['titulo', 'precio', 'celular', 'latitud', 'longitud'];
fieldsToValue.forEach(field => {
    // Busca el input y agrega value={cuarto?.FIELD || ''}
    const regex = new RegExp(`(name="${field}"[^>]*?)(\\/?>)`, 'g');
    formHtml = formHtml.replace(regex, `$1 value={cuarto?.${field} || ""} $2`);
});

const fieldsToTextarea = ['descripcion', 'caracteristicas', 'ubicacion'];
fieldsToTextarea.forEach(field => {
    // Busca textareas y pon el contenido entre tags
    const regex = new RegExp(`(name="${field}"[^>]*?)><\\/textarea>`, 'g');
    formHtml = formHtml.replace(regex, `$1>{cuarto?.${field} || ""}</textarea>`);
});

// Remove existing value from latitud/longitud if any? No, we just added it.
// The form action should change depending on mode
let finalComponent = `---
// src/components/RoomForm.astro
const { mode = "add", cuarto = null } = Astro.props;
const formId = mode === "add" ? "room-form" : "edit-room-form";
const actionUrl = mode === "add" ? "/api/agregar-cuarto" : \`/api/cuartos/\${cuarto?.id}\`;
---

<form
  action={actionUrl}
  method="POST"
  enctype="multipart/form-data"
  id={formId}
  class="space-y-6 sm:space-y-8"
>
  {mode === "edit" && <input type="hidden" name="_method" value="PUT" />}
  ${formHtml}
</form>
`;

// Note: Button text logic inside the form needs to be updated
finalComponent = finalComponent.replace(/id="btn-text">Publicar Cuarto<\/span>/, `id="btn-text">{mode === "add" ? "Publicar Cuarto" : "Guardar Cambios"}</span>`);

fs.writeFileSync(path.join(__dirname, 'src/components/RoomForm.astro'), finalComponent);
console.log("RoomForm created!");
