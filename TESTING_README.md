# Guía de Testing para RANTU Web 🧪

Esta guía detalla cómo está configurado el entorno de pruebas automáticas en la aplicación web de RANTU. Las pruebas (o tests) son esenciales para asegurar que los cambios futuros no rompan las funcionalidades que ya están listas.

## ¿Qué framework utilizamos?
Utilizamos **Vitest** (un entorno de pruebas nativo de Vite). Es rapidísimo, moderno y funciona a la perfección con nuestro proyecto de Astro.

## Comandos de Testing

- `npm run test`: Ejecuta todas las pruebas una sola vez. Útil para verificar antes de subir código a GitHub.
- `npx vitest watch`: Mantiene los tests corriendo en segundo plano. Si haces un cambio en el código y lo guardas, Vitest correrá las pruebas automáticamente.

## Estructura de las Pruebas
Los archivos de prueba deben estar junto al archivo original que están probando y terminar en `.test.js`.
Por ejemplo:
- Lógica original: `src/utils/urlDecoder.js`
- Archivo de prueba: `src/utils/urlDecoder.test.js`

## Cómo escribir una prueba
1. Importa `describe`, `it`, y `expect` desde `vitest`.
2. Importa la función o lógica que quieres probar.
3. Escribe un bloque `it` describiendo el comportamiento esperado y haz una aserción con `expect`.

**Ejemplo básico:**
```javascript
import { describe, it, expect } from 'vitest';
import { miFuncion } from './miFuncion.js';

describe('Pruebas de miFuncion', () => {
  it('debería retornar true si todo está bien', () => {
    expect(miFuncion(true)).toBe(true);
  });
});
```

## Buenas Prácticas
1. **Prueba una sola cosa a la vez**: Cada bloque `it` debe probar un solo comportamiento.
2. **Cubre los casos borde (Edge cases)**: No pruebes solo cuando todo sale bien. ¿Qué pasa si la función recibe `null`? ¿Qué pasa si recibe números negativos?
3. **No pruebes código de librerías externas**: Solo haz pruebas a la lógica que nosotros mismos escribimos. No intentes probar si Supabase funciona, eso ya está probado por el equipo de Supabase.

---
*Si logramos mantener una buena cobertura de pruebas, el equipo de desarrollo podrá agregar funcionalidades sin miedo a romper el resto de RANTU.*
