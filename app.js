/* =========================================================
   app.js — interfaz (usa loto-core.js para la lógica)
   Sin backend: todo corre en el navegador. Ideal GitHub Pages.
   ========================================================= */

const SHEET_ID = "1WGtZG2WWqJjGcJxIzR4-7Hl-090HZB7oxBWocX7A2w0";
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const { MIN, MAX, REQUERIDOS, CATEGORIAS, parseGviz, aciertosDe, evaluarPrincipal } = LotoCore;

let DATA = [];
const seleccion = new Set();

const $ = (s) => document.querySelector(s);
const board = $("#board");
const selSorteo = $("#sorteo");
const sorteoHint = $("#sorteoHint");
const elCount = $("#count");
const elCounter = $("#counter");
const btnRevisar = $("#revisar");
const result = $("#result");

const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- cartilla ---------- */
function construirBoard() {
  const frag = document.createDocumentFragment();
  for (let n = MIN; n <= MAX; n++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ball";
    b.textContent = n;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", `Número ${n}`);
    b.addEventListener("click", () => toggle(n, b));
    frag.appendChild(b);
  }
  board.appendChild(frag);
}
function toggle(n, el) {
  if (seleccion.has(n)) {
    seleccion.delete(n);
    el.classList.remove("is-selected");
    el.setAttribute("aria-pressed", "false");
  } else {
    if (seleccion.size >= REQUERIDOS) return;
    seleccion.add(n);
    el.classList.add("is-selected");
    el.setAttribute("aria-pressed", "true");
  }
  sincronizar();
}
function sincronizar() {
  const n = seleccion.size;
  elCount.textContent = n;
  elCounter.classList.toggle("full", n === REQUERIDOS);
  board.classList.toggle("is-full", n === REQUERIDOS);
  btnRevisar.disabled = !(n === REQUERIDOS && selSorteo.value);
}
function limpiar() {
  seleccion.clear();
  board.querySelectorAll(".ball.is-selected").forEach((b) => {
    b.classList.remove("is-selected"); b.setAttribute("aria-pressed", "false");
  });
  sincronizar();
}
function azar() {
  limpiar();
  const pool = Array.from({ length: MAX }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const botones = board.querySelectorAll(".ball");
  pool.slice(0, REQUERIDOS).forEach((n) => toggle(n, botones[n - 1]));
}

/* ---------- datos ---------- */
async function cargarDatos() {
  const r = await fetch(GVIZ_URL, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return parseGviz(await r.text());
}

/* ---------- render ---------- */
function dot(n, mods = "", extra = "") {
  return `<span class="dot ${mods}" ${extra}>${n}</span>`;
}
function miniBalls(draw, jugados) {
  const hit = new Set(aciertosDe(jugados, draw));
  return draw.map((n) => `<span class="mini ${hit.has(n) ? "mini--hit" : ""}">${n}</span>`).join("");
}

function render(item) {
  const jugados = [...seleccion].sort((a, b) => a - b);
  const jugSet = new Set(jugados);
  const { nombre, aciertos, tieneComodin } = evaluarPrincipal(jugados, item.loto, item.comodin);
  let gano = !!nombre;

  let ballsHTML = item.loto
    .map((n, i) => dot(n, `dot--win ${jugSet.has(n) ? "dot--hit" : ""} is-reveal`,
      `style="animation-delay:${i * 60}ms"`))
    .join("");
  ballsHTML += `<span class="sep"></span>`;
  ballsHTML += dot(item.comodin, `dot--comodin ${tieneComodin ? "dot--hit" : ""} is-reveal`,
    `style="animation-delay:${item.loto.length * 60}ms" title="Comodín"`);

  let verdict;
  if (nombre) {
    const c = CATEGORIAS.find((x) => x[0] === nombre);
    const detalle = c[2] ? `${c[1]} aciertos + comodín` : `${c[1]} aciertos`;
    verdict = `<div class="verdict verdict--win">
        <div class="verdict__icon">🎉</div>
        <div class="verdict__txt"><b>¡Ganaste: ${nombre}!</b><span>${detalle}</span></div>
      </div>`;
  } else {
    const a = aciertos.length;
    verdict = `<div class="verdict verdict--none">
        <div class="verdict__icon">🎲</div>
        <div class="verdict__txt"><b>Sin premio en el sorteo principal</b>
        <span>${a} ${a === 1 ? "acierto" : "aciertos"}${tieneComodin ? " + comodín" : ""}</span></div>
      </div>`;
  }

  const modItems = [];
  const unico = (draw, label) => {
    if (!draw || !draw.length) return;
    const ac = aciertosDe(jugados, draw);
    const win = ac.length === REQUERIDOS;
    if (win) gano = true;
    modItems.push(`<div class="mod">
        <span class="mod__name">${label}</span>
        <span class="mod__balls">${miniBalls(draw, jugados)}</span>
        <span class="mod__tag ${win ? "win" : ""}">${win ? "🎉 ¡Pozo!" : ac.length + " aciertos"}</span>
      </div>`);
  };
  unico(item.recargado, "Recargado");
  unico(item.revancha, "Revancha");
  unico(item.desquite, "Desquite");

  // Jubilazo / Jubilazo 50: mostramos cada serie ganadora con sus números
  // y resaltamos las coincidencias con la cartilla del usuario.
  const jubBloque = (lista, label) => {
    if (!lista || !lista.length) return "";
    let mejor = 0;
    const filas = lista.map((serie, i) => {
      const ac = aciertosDe(jugados, serie);
      const win = ac.length === REQUERIDOS;
      if (ac.length > mejor) mejor = ac.length;
      if (win) gano = true;
      const tag = win ? "🎉 ¡Ganaste!" : `${ac.length}/6`;
      return `<div class="jubrow ${win ? "is-win" : ""}">
          <span class="jubrow__n">Serie ${i + 1}</span>
          <span class="jubrow__balls">${miniBalls(serie, jugados)}</span>
          <span class="jubrow__tag ${win ? "win" : ""}">${tag}</span>
        </div>`;
    }).join("");
    const n = lista.length;
    return `<div class="jub">
        <div class="jub__head">
          <span class="jub__name">${label}</span>
          <span class="jub__sub">${n} ${n === 1 ? "serie" : "series"} · ganas con los 6 exactos de una serie · mejor: ${mejor}/6</span>
        </div>
        <div class="jub__list">${filas}</div>
      </div>`;
  };
  const jubHTML = jubBloque(item.jubilazo, "Jubilazo") + jubBloque(item.jubilazo50, "Jubilazo 50");

  const multiNota = item.multiplicador ? `Multiplicador del sorteo: ×${item.multiplicador}` : "";
  const pozoLine = item.pozo
    ? `<p class="r-pozo">Pozo referencial: $${item.pozo.toLocaleString("es-CL")} millones${multiNota ? " · " + multiNota : ""}</p>`
    : (multiNota ? `<p class="r-pozo">${multiNota}</p>` : "");

  result.innerHTML = `
    <div class="result__panel">
      <div class="r-head">
        <h2>Sorteo ${item.sorteo}</h2>
        <span class="r-date">${item.fechaTxt || ""}</span>
      </div>
      ${pozoLine}

      <p class="r-label">Números ganadores</p>
      <div class="r-balls">${ballsHTML}</div>

      ${verdict}

      ${modItems.length ? `<div class="mods">
        <p class="mods__title">Modalidades adicionales</p>
        <p class="mods__note">Solo cuentan si las contrataste. Recargado, Revancha y Desquite se ganan solo con los 6 aciertos.</p>
        ${modItems.join("")}
      </div>` : ""}

      ${jubHTML ? `<div class="jubs">
        <p class="mods__title">Jubilazo</p>
        <p class="mods__note">Números ganadores de cada serie. Tus aciertos aparecen resaltados en dorado.</p>
        ${jubHTML}
      </div>` : ""}

      <p class="r-source">Resultados que reflejan los oficiales de Polla Chilena.
        Valida siempre un premio en una agencia oficial.</p>
    </div>`;

  result.hidden = false;
  result.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
  if (gano && !prefersReduced()) confeti();
}

function setState(html) {
  result.innerHTML = `<div class="state">${html}</div>`;
  result.hidden = false;
}

function revisar() {
  const item = DATA.find((x) => x.sorteo === selSorteo.value);
  if (!item) {
    setState(`<b>Ese sorteo aún no está disponible</b>
      Los resultados se publican alrededor de las 22:00 h del día del sorteo.`);
    return;
  }
  render(item);
}

function poblarSorteos() {
  if (!DATA.length) {
    selSorteo.innerHTML = `<option value="">Sin datos disponibles</option>`;
    sorteoHint.textContent = "No se pudieron cargar los sorteos. Revisa tu conexión.";
    return;
  }
  selSorteo.innerHTML =
    `<option value="">Selecciona un sorteo…</option>` +
    DATA.map((d) => `<option value="${d.sorteo}">Sorteo ${d.sorteo}${d.fechaTxt ? " · " + d.fechaTxt : ""}</option>`).join("");
  sorteoHint.textContent = `${DATA.length} sorteos disponibles · el más reciente es el ${DATA[0].sorteo}.`;
  selSorteo.addEventListener("change", () => {
    sincronizar();
    if (!result.hidden) result.hidden = true;
  });
}

/* ---------- confeti ---------- */
function confeti() {
  const colores = ["#F6C453", "#A78BFA", "#41E08C", "#FFD874", "#7C5CF0"];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colores[i % colores.length];
    c.style.animationDuration = 2.4 + Math.random() * 1.8 + "s";
    c.style.animationDelay = Math.random() * 0.3 + "s";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4600);
  }
}

/* ---------- init ---------- */
async function init() {
  construirBoard();
  $("#azar").addEventListener("click", azar);
  $("#limpiar").addEventListener("click", limpiar);
  btnRevisar.addEventListener("click", revisar);
  sincronizar();

  try {
    DATA = await cargarDatos();
    poblarSorteos();
  } catch (e) {
    console.error(e);
    selSorteo.innerHTML = `<option value="">Error al cargar</option>`;
    sorteoHint.textContent = "No se pudieron cargar los resultados. Revisa tu conexión e inténtalo de nuevo.";
  }
}
document.addEventListener("DOMContentLoaded", init);
