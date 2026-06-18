/* =========================================================
   loto-core.js — lógica pura (parseo + reglas de premios)
   Funciona en el navegador (global window.LotoCore) y en
   Node.js (module.exports), para poder testearla sin DOM.
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api; // Node
  root.LotoCore = api;                                                       // navegador
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MIN = 1, MAX = 41, REQUERIDOS = 6;

  // [nombre, aciertos, requiereComodin] — de mayor a menor premio
  const CATEGORIAS = [
    ["Loto", 6, false],
    ["Súper Quina", 5, true],
    ["Quina", 5, false],
    ["Súper Cuaterna", 4, true],
    ["Cuaterna", 4, false],
    ["Súper Terna", 3, true],
    ["Terna", 3, false],
    ["Súper Dupla", 2, true],
  ];

  // ---- parseo ----
  function claveColumna(label) {
    if (!label) return "";
    const partes = String(label).split(/\s+/).filter((p) => !/^https?:\/\//i.test(p));
    return partes.join(" ").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "").replace(/[^\w]/g, "");
  }
  const nums = (v) => (v == null ? [] : (String(v).match(/\d+/g) || []).map(Number));
  function jugadas(v) {
    if (!v) return [];
    return String(v).split(/[\n\r]+/)
      .map((l) => (l.match(/\d+/g) || []).map(Number))
      .filter((j) => j.length === REQUERIDOS);
  }
  function fechaInfo(v) {
    if (!v) return { txt: "", obj: null };
    const m = String(v).match(/Date\((\d+),(\d+),(\d+)/); // mes 0-indexado
    if (!m) return { txt: String(v), obj: null };
    const obj = new Date(+m[1], +m[2], +m[3]);
    const txt = `${String(+m[3]).padStart(2, "0")}-${String(+m[2] + 1).padStart(2, "0")}-${m[1]}`;
    return { txt, obj };
  }

  // Convierte el texto crudo del endpoint gviz en una lista de sorteos.
  function parseGviz(texto) {
    const m = texto.match(/setResponse\(([\s\S]*?)\);?\s*$/) || texto.match(/setResponse\(([\s\S]*)\)/);
    if (!m) throw new Error("formato gviz inesperado");
    const tabla = JSON.parse(m[1]).table;

    const col = {};
    (tabla.cols || []).forEach((c, i) => { const k = claveColumna(c.label); if (k) col[k] = i; });
    const get = (row, k) => (col[k] != null && row.c[col[k]] ? row.c[col[k]].v : null);

    return (tabla.rows || [])
      .map((row) => {
        const s = get(row, "sorteo");
        if (s == null) return null;
        const f = fechaInfo(get(row, "fecha"));
        const r = {
          sorteo: String(s).split(".")[0],
          fechaTxt: f.txt, fechaObj: f.obj,
          pozo: nums(get(row, "monto"))[0] ?? null,
          loto: nums(get(row, "loto")),
          comodin: nums(get(row, "comodin"))[0] ?? null,
          multiplicador: nums(get(row, "multiplicador"))[0] ?? null,
          recargado: nums(get(row, "recargado")),
          revancha: nums(get(row, "revancha")),
          desquite: nums(get(row, "desquite")),
          jubilazo: jugadas(get(row, "jubilazo")),
          jubilazo50: jugadas(get(row, "jubilazo50")),
        };
        return r.loto.length === REQUERIDOS ? r : null;
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.sorteo) - Number(a.sorteo));
  }

  // ---- reglas ----
  function aciertosDe(jug, gan) {
    const set = new Set(gan);
    return jug.filter((n) => set.has(n)).sort((a, b) => a - b);
  }
  function evaluarPrincipal(jug, gan, comodin) {
    const aciertos = aciertosDe(jug, gan);
    const tieneComodin = jug.includes(comodin);
    const n = aciertos.length;
    for (const [nombre, req, reqCom] of CATEGORIAS) {
      if (n === req && (reqCom ? tieneComodin : true)) {
        return { nombre, aciertos, tieneComodin };
      }
    }
    return { nombre: null, aciertos, tieneComodin };
  }
  function mejorJubilazo(jug, listaJugadas) {
    let best = 0, gana = false;
    for (const j of listaJugadas) {
      const c = aciertosDe(jug, j).length;
      if (c > best) best = c;
      if (c === REQUERIDOS) gana = true;
    }
    return { best, gana, sorteos: listaJugadas.length };
  }

  return {
    MIN, MAX, REQUERIDOS, CATEGORIAS,
    claveColumna, nums, jugadas, fechaInfo, parseGviz,
    aciertosDe, evaluarPrincipal, mejorJubilazo,
  };
});
