let datos = null
let filasTabla = []
let plataformaActual = 'bluesky'
let miGrafico = null
let graficoPlatforma = null

// Cargar los datos reales desde datos.json
fetch('datos.json')
  .then(response => response.json())
  .then(json => {
    datos = json
    filasTabla = json.tabla

    construirGraficoGeneral()
    construirTabla()
  })
  .catch(error => {
    console.error('Error cargando datos.json:', error)
  })

// Gráfico general combinado
function construirGraficoGeneral() {
  const etiquetas = datos.bluesky.etiquetas

  const valoresCombinados = etiquetas.map((etiqueta, i) => {
    const valorBluesky = datos.bluesky.valores[i] || 0
    const indiceFuente2 = datos.fuente2.etiquetas.indexOf(etiqueta)
    const valorFuente2 = indiceFuente2 !== -1 ? datos.fuente2.valores[indiceFuente2] : 0
    return valorBluesky + valorFuente2
  })

  const ctx = document.getElementById('mi-grafico').getContext('2d')
  if (miGrafico) miGrafico.destroy()

  miGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        label: 'Total de posts',
        data: valoresCombinados,
        backgroundColor: '#534AB7'
      }]
    }
  })
}

// Llenar la tabla
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

// Gráfico por plataforma
function construirGraficoPlatforma() {
  const d = datos[plataformaActual]
  const ctx = document.getElementById('grafico-plataforma').getContext('2d')

  if (graficoPlatforma) graficoPlatforma.destroy()

  graficoPlatforma = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.etiquetas,
      datasets: [{
        label: plataformaActual,
        data: d.valores,
        backgroundColor: '#534AB7'
      }]
    },
    options: {
      onClick: (evento, elementos) => {
        if (elementos.length > 0) {
          const indice = elementos[0].index
          const etiqueta = d.etiquetas[indice]
          mostrarDetalle(etiqueta)
        }
      }
    }
  })
}

function cambiarPlataforma(plataforma) {
  plataformaActual = plataforma
  const d = datos[plataforma]
  const nombreMostrado = d.nombre || (plataforma === 'bluesky' ? 'Bluesky' : plataforma)

  document.getElementById('nombre-plataforma').textContent = nombreMostrado
  document.getElementById('vista-inicio').style.display = 'none'
  document.getElementById('vista-plataforma').style.display = 'block'
  construirGraficoPlatforma()
}

function volverInicio() {
  document.getElementById('vista-plataforma').style.display = 'none'
  document.getElementById('vista-inicio').style.display = 'flex'
}

function mostrarDetalle(etiqueta) {
  abrirModal(etiqueta)
}

function abrirModal(etiqueta) {
  document.getElementById('modal-titulo').textContent = etiqueta
  document.getElementById('modal-plataforma').textContent = plataformaActual
  document.getElementById('modal-resumen').textContent = 'Análisis pendiente de conectar con datos reales.'
  document.getElementById('modal-overlay').style.display = 'flex'
}

function cerrarModal() {
  document.getElementById('modal-overlay').style.display = 'none'
}

