# 🏠 RANTU - Aplicación Web (Plataforma de Alquiler de Cuartos)

Una plataforma moderna, modular y altamente optimizada para alquilar cuartos, construida con **Astro**, **Supabase** y **Tailwind CSS**. 

## 🚀 Características Principales

### 🔐 Sistema de Autenticación
- Registro e inicio de sesión seguro con Supabase.
- Autenticación OTP y manejo de sesiones con cookies seguras.
- Middleware de protección de rutas privadas (ej. `/mis-cuartos`).

### 🏡 Gestión de Cuartos
- **CRUD completo** para propietarios.
- **Subida de imágenes** con compresión en cliente (limitado a 2MB-5MB según dispositivo) y Drag & Drop.
- **Geolocalización en Tiempo Real:** Integración con **Leaflet** y OpenStreetMap para ubicar propiedades con precisión.
- **Filtros de búsqueda** dinámicos.
- **Descargas de Tarjetas** promocionales generadas usando `html-to-image`.

### ⭐ Sistema de Comentarios y Calificaciones
- Calificaciones (1-5 ⭐) y reseñas detalladas.
- Estadísticas en tiempo real (promedio y conteo).
- Restricción de un comentario por usuario por cuarto.

---

## 🏗️ Arquitectura y Clean Code (Refactorización 2.0)

Este proyecto fue sometido a una **auditoría y reestructuración completa** aplicando principios SOLID y *Clean Code* para eliminar la deuda técnica ("código espagueti"). Las mejoras implementadas son:

1. **Modularización de Componentes Astro:**
   - Formularios unificados: Se extrajo la lógica visual a `RoomForm.astro`, reduciendo cientos de líneas de duplicación entre `/agregar-cuarto` y `/editar-cuarto`.
   - Fragmentación de componentes de UI (Tarjetas, Formularios de Login, etc.).

2. **Separación de Responsabilidades (JS):**
   - **`image-uploader.js`**: Archivo dedicado exclusivamente a compresión y subida de imágenes (antes mezclado con mapas).
   - **`form-map.js`**: Abstracción del mapa Leaflet interactivo que alimenta los inputs ocultos de latitud/longitud.
   - **`pureFilters.js` y `map.js`**: La lógica pesada de la página principal (`busquedaCuartos.js`) fue dividida en funciones puras testeables.

3. **Validadores Centralizados:**
   - Toda la validación backend y de APIs (ej. en `/api/cuartos/[id].js`) ocurre mediante un utilitario central `validators.js`.

---

## 🧪 Testing y Pruebas Unitarias (TDD)

Se ha integrado **Vitest** y **MockK** para asegurar que el sistema no se rompa a medida que crece.

### ¿Cómo ejecutar las pruebas?
1. Instalar dependencias: `npm install`
2. Ejecutar pruebas unitarias: `npm run test`
3. Ver cobertura del código: `npm run coverage`

**Casos cubiertos actualmente:**
- **Validación de Formularios:** Se comprueba que los campos obligatorios envíen el error correcto.
- **Filtrado de Búsqueda:** Pruebas para garantizar que buscar por precio o nombre devuelva los cuartos correctos de forma precisa (funciones puras en `pureFilters.js`).
- *Nota: Al aplicar TDD, se garantiza que cualquier refactorización visual mantenga la integridad de los datos.*

---

## 🛠️ Instalación y Desarrollo

1. Clonar el repositorio.
2. Crear un archivo `.env` basado en `.env.example` y agregar las credenciales de Supabase (`PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`).
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Levantar servidor local:
   ```bash
   npm run dev
   ```

## 📜 Licencia y Autor
Desarrollado como proyecto de Estadías.
