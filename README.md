# ¿Ganaste el Loto? 🎲🇨🇱

Sitio web estático para revisar **al instante** si ganaste algún premio del
**Loto de Chile**. Marca tus 6 números en la cartilla, elige el sorteo y listo:
te dice tu categoría y revisa todas las modalidades.

- ⚡ **Rápido**: carga los datos una vez y evalúa todo en el navegador.
- 📱 **Responsivo**: pensado para el celular (balotas grandes, fáciles de tocar).
- 🔌 **Sin backend**: HTML + CSS + JS puro. Se publica gratis en GitHub Pages.

---

## 🗂️ Estructura

```
index.html      Estructura de la página
styles.css      Diseño (tema "noche de sorteo")
loto-core.js    Lógica pura: parseo de datos + reglas de premios
app.js          Interfaz: cartilla, eventos y render del resultado
tests/          Pruebas (Node)
```

La lógica vive en `loto-core.js` (sin DOM), por eso se puede **testear** sin
navegador. `app.js` solo arma la interfaz.

---

## 🚀 Publicar en GitHub Pages (paso a paso)

1. Crea un repositorio en GitHub y sube estos archivos (deben quedar en la raíz):
   ```bash
   git init
   git add .
   git commit -m "App para revisar el Loto"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. Guarda. En ~1 minuto tu sitio estará en:
   `https://TU_USUARIO.github.io/TU_REPO/`

¡Eso es todo! Cualquiera puede usarlo desde ese link.

---

## 💻 Probar en tu computador (antes de subir)

No basta con abrir `index.html` con doble clic (el navegador bloquea el `fetch`
por seguridad con `file://`). Levanta un servidor local:

```bash
# con Python
python3 -m http.server 8000
# luego abre http://localhost:8000
```

---

## 🧪 Ejecutar las pruebas (opcional)

```bash
npm install        # instala jsdom (solo para tests)
npm test           # corre lógica + integración de UI
```

`tests/core.test.mjs` valida el parseo y las 8 categorías (no necesita
dependencias). `tests/ui.test.mjs` simula la interfaz con jsdom.

---

## 📊 ¿De dónde salen los datos?

De un **Google Sheet público** consultado por su endpoint
`gviz/tq?tqx=out:json`, que refleja los resultados oficiales de Polla Chilena.
Es una fuente JSON estable y global (sin bloqueo de bots ni JavaScript del lado
del servidor), por eso funciona bien desde un sitio estático.

> Si quieres usar **tu propia** planilla, cambia `SHEET_ID` en `app.js` (y en
> `loto-core.js` si testeas). La hoja debe tener columnas con encabezados:
> `sorteo, fecha, monto, loto, comodin, multiplicador, recargado, revancha,
> desquite, jubilazo, jubilazo50`. En `jubilazo` cada sorteo va en una línea.

---

## 🏆 Reglas que aplica

**Sorteo principal (8 categorías):** Loto (6), Súper Quina (5+comodín),
Quina (5), Súper Cuaterna (4+comodín), Cuaterna (4), Súper Terna (3+comodín),
Terna (3), Súper Dupla (2+comodín). Mínimo para ganar: 3 aciertos, o 2+comodín.

**Modalidades** (con los mismos 6 números): Recargado, Revancha y Desquite se
ganan solo con los 6 aciertos; Jubilazo y Jubilazo 50, solo con los 6 exactos.

---

## ⚠️ Aviso

Proyecto **no oficial**, de uso informativo/educativo, sin relación con Polla
Chilena de Beneficencia. Para cobrar un premio, valida tu boleto en una agencia
oficial. Juega con responsabilidad.

## Licencia

MIT — ver [LICENSE](LICENSE).
