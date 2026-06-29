// ── Tema global Chart.js ──────────────────────
Chart.defaults.color       = '#948f9a'
Chart.defaults.borderColor = 'rgba(73,69,79,0.35)'
Chart.defaults.font.family = "'Be Vietnam Pro', sans-serif"
Chart.defaults.font.size   = 13

// ── Animación moderna para barras ─────────────
// Crecen desde el centro hacia afuera con delay escalonado
const animacionModerna = {
  animation: {
    duration: 900,
    easing: 'easeOutQuart',
    delay: (ctx) => {
      if (ctx.type !== 'data' || ctx.mode !== 'default') return 0
      return ctx.dataIndex * 80
    }
  },
  transitions: {
    active: { animation: { duration: 200 } }
  }
}

// ── Typewriter ────────────────────────────────
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

// ── Control de animaciones de entrada ────────
const ELEMENTOS_ANIMADOS = [
  '#encabezado p',
  '.contenedor-botones',
  '#seccion-grafico',
  '#seccion-tabla'
]

function activarAnimaciones() {
  ELEMENTOS_ANIMADOS.forEach(sel => {
    const el = document.querySelector(sel)
    if (!el) return
    // Reiniciar: quitar clase, forzar reflow, volver a poner
    el.classList.remove('animar-entrada')
    void el.offsetWidth   // fuerza reflow del navegador
    el.classList.add('animar-entrada')
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const span = document.getElementById('texto-titulo')
  if (span) typewriter(TITULO, span, 55)
  activarAnimaciones()
})

// ── Estado global ─────────────────────────────
let datos          = null
let filasTabla     = []
let plataformaActual = 'bluesky'
let miGrafico      = null   // se crea una sola vez
let graficoPlatforma = null
let filasMostradas = 10     // paginación tabla

// ── Cargar datos.json ─────────────────────────
fetch('datos.json')
  .then(res => res.json())
  .then(json => {
    datos      = json
    filasTabla = json.tabla || []
    renderTabla()
    // El gráfico general se construye cuando #seccion-grafico
    // se hace visible (~2.8s de delay en la animación CSS)
    setTimeout(construirGraficoGeneral, 2900)
  })
  .catch(() => {
    document.getElementById('cuerpo-tabla').innerHTML =
      `<tr><td colspan="4" style="color:#ffb4ab;padding:20px">
        ⚠ No se pudo cargar datos.json. Usá Live Server o python -m http.server.
      </td></tr>`
  })

// ── Gráfico general (se crea UNA sola vez) ────
function construirGraficoGeneral() {
  const todasEtiquetas = [...new Set([
    ...datos.bluesky.etiquetas,
    ...datos.fuente2.etiquetas
  ])]

  const valoresCombinados = todasEtiquetas.map(etiqueta => {
    const iBsky    = datos.bluesky.etiquetas.indexOf(etiqueta)
    const iFuente2 = datos.fuente2.etiquetas.indexOf(etiqueta)
    return (iBsky    !== -1 ? datos.bluesky.valores[iBsky]    : 0)
         + (iFuente2 !== -1 ? datos.fuente2.valores[iFuente2] : 0)
  })

  const ctx = document.getElementById('mi-grafico').getContext('2d')

  miGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: todasEtiquetas,
      datasets: [{
        label: 'Total de posts',
        data: valoresCombinados,
        backgroundColor: 'rgba(208,188,255,0.75)',
        borderColor: '#d0bcff',
        borderWidth: 1,
        borderRadius: 10,
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
      ...animacionModerna
    }
  })
}

// ── Tabla con paginación ──────────────────────
function renderTabla() {
  const cuerpo = document.getElementById('cuerpo-tabla')
  cuerpo.innerHTML = ''

  const visibles = filasTabla.slice(0, filasMostradas)
  visibles.forEach(fila => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${fila.fecha}</td>
      <td>${fila.estafa}</td>
      <td>${fila.fuente}</td>
      <td><a href="${fila.url}" target="_blank">${fila.url}</a></td>
    `
    cuerpo.appendChild(tr)
  })

  // Fila de controles al final
  const hayMas = filasTabla.length > filasMostradas
  const trControles = document.createElement('tr')
  trControles.id = 'fila-controles'
  trControles.innerHTML = `
    <td colspan="2" style="padding:0">
      <button class="btn-tabla ${hayMas ? '' : 'btn-tabla--disabled'}"
              onclick="mostrarMas()"
              ${hayMas ? '' : 'disabled'}>
        ${hayMas ? `▼ Mostrar más (${filasTabla.length - filasMostradas} restantes)` : '✓ Todos los datos visibles'}
      </button>
    </td>
    <td colspan="2" style="padding:0">
      <button class="btn-tabla btn-tabla--csv" onclick="descargarCSV()">
        ↓ Descargar CSV
      </button>
    </td>
  `
  cuerpo.appendChild(trControles)
}

function mostrarMas() {
  filasMostradas += 20
  renderTabla()
}

// ── Descargar CSV ─────────────────────────────
function descargarCSV() {
  const cabecera = ['Fecha', 'Tipo de estafa', 'Fuente', 'URL']
  const filas = filasTabla.map(f =>
    [f.fecha, f.estafa, f.fuente, f.url]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = [cabecera.join(','), ...filas].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `monitor_desinformacion_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Gráfico por plataforma ────────────────────
function construirGraficoPlatforma() {
  const d   = datos[plataformaActual]
  const ctx = document.getElementById('grafico-plataforma').getContext('2d')
  if (graficoPlatforma) graficoPlatforma.destroy()

  const esHN = plataformaActual === 'fuente2'
  const color  = esHN ? 'rgba(239,184,200,0.75)' : 'rgba(208,188,255,0.75)'
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
        borderRadius: 10,
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
      ...animacionModerna,
      onClick: (evento, elementos) => {
        if (elementos.length > 0) {
          abrirModal(d.etiquetas[elementos[0].index], d.valores[elementos[0].index])
        }
      }
    }
  })
}

// ── Navegación ────────────────────────────────
function cambiarPlataforma(plataforma) {
  plataformaActual = plataforma
  const d      = datos[plataforma]
  const nombre = d.nombre || (plataforma === 'bluesky' ? 'Bluesky' : plataforma)

  document.getElementById('nombre-plataforma').textContent = nombre
  document.getElementById('vista-inicio').style.display    = 'none'
  document.getElementById('vista-plataforma').style.display = 'block'

  document.querySelectorAll('.btn-plataforma').forEach(b => b.classList.remove('activo'))
  event.target.classList.add('activo')

  construirGraficoPlatforma()
}

function volverInicio() {
  document.getElementById('vista-plataforma').style.display = 'none'
  document.getElementById('vista-inicio').style.display     = 'block'
  document.querySelectorAll('.btn-plataforma').forEach(b => b.classList.remove('activo'))

  // Reiniciar typewriter + animaciones de entrada
  const span = document.getElementById('texto-titulo')
  if (span) typewriter(TITULO, span, 55)
  activarAnimaciones()

  // Destruir y recrear el gráfico general para que las barras
  // vuelvan a animarse cuando #seccion-grafico aparece (~2.8s)
  if (miGrafico) { miGrafico.destroy(); miGrafico = null }
  setTimeout(construirGraficoGeneral, 2900)
}

// ── Modal ─────────────────────────────────────
function abrirModal(etiqueta) {
  document.getElementById('modal-titulo').textContent = etiqueta
  document.getElementById('modal-plataforma').textContent = plataformaActual === 'bluesky' ? 'Bluesky' : datos.fuente2.nombre

  const contenido = document.getElementById('modal-resumen')

  // Si es Bluesky y tiene análisis para esta categoría
  if (plataformaActual === 'bluesky' && datos.bluesky.analisis && datos.bluesky.analisis[etiqueta]) {
    const a = datos.bluesky.analisis[etiqueta]

    // Ordenar señales de mayor a menor
    const señalesOrdenadas = Object.entries(a.señales_frecuentes)
      .sort((x, y) => y[1] - x[1])
      .map(([señal, cantidad]) => `${señal}: ${cantidad} posts`)
      .join('\n')

    contenido.innerHTML = `
      <div class="modal-stat">
        <span class="modal-stat-label">Posts analizados</span>
        <span class="modal-stat-valor">${a.total_posts}</span>
      </div>
      <div class="modal-stat">
        <span class="modal-stat-label">Cuentas sospechosas (2+ señales)</span>
        <span class="modal-stat-valor">${a.total_sospechosos} (${a.porcentaje_sospechosos}%)</span>
      </div>
      <div class="modal-señales">
        <p class="modal-señales-titulo">Señales detectadas:</p>
        ${Object.entries(a.señales_frecuentes)
          .sort((x, y) => y[1] - x[1])
          .map(([señal, cantidad]) => `
            <div class="modal-señal-fila">
              <span>${señal}</span>
              <span class="modal-señal-count">${cantidad}</span>
            </div>`)
          .join('')}
      </div>
    `
  } else {
    contenido.innerHTML = '<p>Análisis no disponible para esta fuente.</p>'
  }

  document.getElementById('modal-overlay').style.display = 'flex'
}

function cerrarModal() {
  document.getElementById('modal-overlay').style.display = 'none'
}
