// ── Tema global Chart.js ──────────────────────
Chart.defaults.color       = '#948f9a'
Chart.defaults.borderColor = 'rgba(73,69,79,0.35)'
Chart.defaults.font.family = "'Be Vietnam Pro', sans-serif"
Chart.defaults.font.size   = 13

// ── Efecto typewriter en el título ───────────
const TITULO = 'Monitor de Desinformación'

function typewriter(texto, elemento, velocidad = 55) {
  let i = 0
  elemento.textContent = ''
  const intervalo = setInterval(() => {
    elemento.textContent += texto[i]
    i++
    if (i >= texto.length) clearInterval(intervalo)
  }, velocidad)
}

document.addEventListener('DOMContentLoaded', () => {
  const span = document.getElementById('texto-titulo')
  if (span) typewriter(TITULO, span, 55)
})

// ── Datos y estado ────────────────────────────
let datos = null
let filasTabla = []
let plataformaActual = 'bluesky'
let miGrafico = null
let graficoPlatforma = null

// ── Cargar datos.json ─────────────────────────
fetch('datos.json')
  .then(res => res.json())
  .then(json => {
    datos = json
    filasTabla = json.tabla || []
    construirGraficoGeneral()
    construirTabla()
  })
  .catch(err => {
    console.error('Error cargando datos.json:', err)
    document.getElementById('cuerpo-tabla').innerHTML =
      `<tr><td colspan="4" style="color:#ffb4ab;padding:20px">
        ⚠ No se pudo cargar datos.json. Usá Live Server o python -m http.server.
      </td></tr>`
  })

// ── Gráfico general ───────────────────────────
function construirGraficoGeneral() {
  const todasEtiquetas = [...new Set([
    ...datos.bluesky.etiquetas,
    ...datos.fuente2.etiquetas
  ])]

  const valoresCombinados = todasEtiquetas.map(etiqueta => {
    const iBsky = datos.bluesky.etiquetas.indexOf(etiqueta)
    const iFuente2 = datos.fuente2.etiquetas.indexOf(etiqueta)
    return (iBsky !== -1 ? datos.bluesky.valores[iBsky] : 0)
         + (iFuente2 !== -1 ? datos.fuente2.valores[iFuente2] : 0)
  })

  const ctx = document.getElementById('mi-grafico').getContext('2d')
  if (miGrafico) miGrafico.destroy()

  miGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: todasEtiquetas,
      datasets: [{
        label: 'Total de posts',
        data: valoresCombinados,
        backgroundColor: 'rgba(208,188,255,0.7)',
        borderColor: '#d0bcff',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(73,69,79,0.3)' } },
        x: { grid: { display: false } }
      }
    }
  })
}

// ── Tabla ─────────────────────────────────────
function construirTabla() {
  const cuerpo = document.getElementById('cuerpo-tabla')
  cuerpo.innerHTML = ''
  filasTabla.forEach(fila => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${fila.fecha}</td>
      <td>${fila.estafa}</td>
      <td>${fila.fuente}</td>
      <td><a href="${fila.url}" target="_blank">${fila.url}</a></td>
    `
    cuerpo.appendChild(tr)
  })
}

// ── Gráfico por plataforma ────────────────────
function construirGraficoPlatforma() {
  const d = datos[plataformaActual]
  const ctx = document.getElementById('grafico-plataforma').getContext('2d')
  if (graficoPlatforma) graficoPlatforma.destroy()

  const esHN = plataformaActual === 'fuente2'
  const color  = esHN ? 'rgba(239,184,200,0.7)' : 'rgba(208,188,255,0.7)'
  const border = esHN ? '#efb8c8' : '#d0bcff'

  graficoPlatforma = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.etiquetas,
      datasets: [{
        label: d.nombre || 'Bluesky',
        data: d.valores,
        backgroundColor: color,
        borderColor: border,
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(73,69,79,0.3)' } },
        x: { grid: { display: false } }
      },
      onClick: (evento, elementos) => {
        if (elementos.length > 0) {
          const idx = elementos[0].index
          abrirModal(d.etiquetas[idx], d.valores[idx])
        }
      }
    }
  })
}

// ── Navegación ────────────────────────────────
function cambiarPlataforma(plataforma) {
  plataformaActual = plataforma
  const d = datos[plataforma]
  const nombre = d.nombre || (plataforma === 'bluesky' ? 'Bluesky' : plataforma)

  document.getElementById('nombre-plataforma').textContent = nombre
  document.getElementById('vista-inicio').style.display = 'none'
  document.getElementById('vista-plataforma').style.display = 'block'

  document.querySelectorAll('.btn-plataforma').forEach(btn => btn.classList.remove('activo'))
  event.target.classList.add('activo')

  if (datos) construirGraficoPlatforma()
}

function volverInicio() {
  document.getElementById('vista-plataforma').style.display = 'none'
  document.getElementById('vista-inicio').style.display = 'block'
  document.querySelectorAll('.btn-plataforma').forEach(btn => btn.classList.remove('activo'))
}

// ── Modal ─────────────────────────────────────
function abrirModal(etiqueta, cantidad) {
  const nombre = datos[plataformaActual].nombre || plataformaActual
  document.getElementById('modal-titulo').textContent = etiqueta
  document.getElementById('modal-plataforma').textContent = nombre.toUpperCase()
  document.getElementById('modal-resumen').textContent =
    `Se detectaron ${cantidad} posts relacionados con "${etiqueta}" en ${nombre}.`
  document.getElementById('modal-overlay').style.display = 'flex'
}

function cerrarModal() {
  document.getElementById('modal-overlay').style.display = 'none'
}
