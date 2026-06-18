# ¿Ganaste el Loto? 🎲🇨🇱

Sitio web para revisar **al instante** si ganaste algún premio del **Loto de Chile**. Marca tus 6 números en la cartilla, elige el sorteo y te dice tu categoría automáticamente, revisando todas las modalidades disponibles.

**Demo en vivo:** [sbxz.github.io/loto-consulta](https://sebas910.github.io/Consulta_Lotto)

---

## ¿Cómo se usa?

1. **Elige el sorteo** en el selector desplegable (se cargan los sorteos más recientes automáticamente).
2. **Marca tus 6 números** en la cartilla haciendo clic sobre ellos.
3. **Lee el resultado**: el sitio te indica si ganaste y en qué categoría, revisando el sorteo principal y todas las modalidades (Recargado, Revancha, Desquite, Jubilazo y Jubilazo 50).

No necesitas registrarte ni instalar nada. Todo funciona directamente en el navegador.

---

## Categorías que se verifican

**Sorteo principal (8 categorías):**

| Categoría | Condición |
|---|---|
| Loto | 6 aciertos |
| Súper Quina | 5 aciertos + comodín |
| Quina | 5 aciertos |
| Súper Cuaterna | 4 aciertos + comodín |
| Cuaterna | 4 aciertos |
| Súper Terna | 3 aciertos + comodín |
| Terna | 3 aciertos |
| Súper Dupla | 2 aciertos + comodín |

**Modalidades:** Recargado, Revancha y Desquite requieren los 6 aciertos. Jubilazo y Jubilazo 50 requieren los 6 números exactos.

---

## Características

- **Sin registro ni instalación** — funciona directo en el navegador.
- **Responsivo** — optimizado para celular, con balotas grandes y fáciles de tocar.
- **Sin backend** — HTML + CSS + JS puro; los datos se cargan desde una fuente pública oficial.
- **Rápido** — carga los datos una vez y evalúa todo localmente.

---

## Ejecutar localmente

Si quieres correr el proyecto en tu computador, clona el repositorio y levanta un servidor local (no basta con abrir `index.html` directamente, el navegador bloquea el `fetch` con `file://`):

```bash
git clone https://github.com/Sbxz/loto-consulta.git
cd loto-consulta
python3 -m http.server 8000
# Abre http://localhost:8000 en tu navegador
```

---

## Tecnologías

- HTML, CSS y JavaScript puro (sin frameworks).
- Datos obtenidos desde un Google Sheet público con resultados de Polla Chilena de Beneficencia.

---

## Aviso

Proyecto **no oficial**, de uso informativo. No tiene relación con Polla Chilena de Beneficencia. Para cobrar un premio, valida tu boleto en una agencia oficial. Juega con responsabilidad.

---

## Licencia

MIT — ver [LICENSE](LICENSE).
