// ── Tema global Chart.js ──────────────────────
Chart.defaults.color       = '#948f9a'
Chart.defaults.borderColor = 'rgba(73,69,79,0.35)'
Chart.defaults.font.family = "'Be Vietnam Pro', sans-serif"
Chart.defaults.font.size   = 13

let datosGlobales = null
let plataformaActual = 'bluesky'
let miGrafico = null
let graficoPlatforma = null

// ── Cargar datos.json ──────────────────────────
fetch('datos.json')
  .then(res => res.json())
  .then(data => {
    datosGlobales = data
    construirGraficoGeneral()
    construirTabla()
  })
  .catch(err => {
    console.error('Error cargando datos.json:', err)
    document.getElementById('vista-inicio').innerHTML +=
      '<p style="color:#ffb4ab">⚠ No se pudo cargar datos.json. Abrí el proyecto con un servidor local (Live Server o python -m http.server).</p>'
  })

// ── Gráfico general ────────────────────────────
function construirGraficoGeneral() {
  const d = datosGlobales.bluesky
  const ctx = document.getElementById('mi-grafico').getContext('2d')
  if (miGrafico) miGrafico.destroy()

  miGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.etiquetas,
      datasets: [{
        label: 'Posts detectados',
        data: d.valores,
        backgroundColor: 'rgba(208,188,255,0.7)',
        borderColor: '#d0bcff',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(73,69,79,0.3)' } },
        x: { grid: { display: false } }
      }
    }
  })
}

// ── Tabla ──────────────────────────────────────
function construirTabla() {
  const cuerpo = document.getElementById('cuerpo-tabla')
  cuerpo.innerHTML = ''
  const filas = datosGlobales.tabla || []

  filas.forEach(fila => {
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

// ── Gráfico por plataforma ─────────────────────
function construirGraficoPlatforma() {
  const d = datosGlobales[plataformaActual]
  if (!d) {
    document.getElementById('grafico-plataforma').style.display = 'none'
    return
  }

  document.getElementById('grafico-plataforma').style.display = 'block'
  const ctx = document.getElementById('grafico-plataforma').getContext('2d')
  if (graficoPlatforma) graficoPlatforma.destroy()

  const color = plataformaActual === 'reddit'
    ? 'rgba(239,184,200,0.7)'
    : 'rgba(208,188,255,0.7)'
  const border = plataformaActual === 'reddit' ? '#efb8c8' : '#d0bcff'

  graficoPlatforma = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.etiquetas,
      datasets: [{
        label: plataformaActual,
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

// ── Navegación ─────────────────────────────────
function cambiarPlataforma(plataforma) {
  plataformaActual = plataforma
  document.getElementById('nombre-plataforma').textContent = plataforma
  document.getElementById('vista-inicio').style.display = 'none'
  document.getElementById('vista-plataforma').style.display = 'block'

  // Resaltar botón activo
  document.querySelectorAll('.btn-plataforma').forEach(btn => btn.classList.remove('activo'))
  event.target.classList.add('activo')

  if (datosGlobales) construirGraficoPlatforma()
}

function volverInicio() {
  document.getElementById('vista-plataforma').style.display = 'none'
  document.getElementById('vista-inicio').style.display = 'block'
  document.querySelectorAll('.btn-plataforma').forEach(btn => btn.classList.remove('activo'))
}

// ── Modal ──────────────────────────────────────
function abrirModal(etiqueta, cantidad) {
  document.getElementById('modal-titulo').textContent = etiqueta
  document.getElementById('modal-plataforma').textContent = plataformaActual.toUpperCase()
  document.getElementById('modal-resumen').textContent =
    `Se detectaron ${cantidad} posts relacionados con "${etiqueta}" en ${plataformaActual}.`
  document.getElementById('modal-overlay').style.display = 'flex'
}

function cerrarModal() {
  document.getElementById('modal-overlay').style.display = 'none'
}
