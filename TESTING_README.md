# 🧪 Guía Oficial de Testing - RANTU Web

Esta guía documenta la infraestructura de pruebas automatizadas (Test-Driven Development) aplicada a la Aplicación Web.

## 🛠️ Herramientas Utilizadas
- **Vitest**: Framework de pruebas ultrarrápido nativo de Vite.
- **MockK / Vi**: Utilidades para simular peticiones de red y APIs.

## 📂 ¿Dónde están las pruebas?
Todos los archivos de prueba terminan en `.test.js` o `.spec.js`.
Por ejemplo, si tienes `pureFilters.js`, su prueba correspondiente será `pureFilters.test.js`.

## 🚀 Ejecutar las Pruebas

Para correr todas las pruebas unitarias y ver los resultados en la terminal:
```bash
npm run test
```

Para correr las pruebas con observación continua (Watch Mode), útil durante el desarrollo:
```bash
npx vitest
```

## 📝 Casos de Prueba Implementados

1. **Filtros de Búsqueda (`pureFilters.test.js`)**:
   - Comprueba que la búsqueda por texto ignore mayúsculas y acentos.
   - Valida que el filtro de precio máximo excluya correctamente los cuartos que superan el límite.
   - Verifica que si no hay coincidencias, el arreglo devuelto esté vacío.

2. **Validación de Formularios (`validators.test.js`)**:
   - Evalúa el comportamiento ante datos nulos o vacíos.
   - Verifica que el precio no pueda ser negativo o letras.
   - Confirma el manejo correcto de longitudes mínimas en descripciones.

## 🛡️ Beneficios para el Proyecto
Al aplicar pruebas unitarias automatizadas a la lógica pura del negocio (desacoplada de Astro/UI), garantizamos que ninguna futura actualización visual rompa la búsqueda o la seguridad de inserción de la base de datos.
