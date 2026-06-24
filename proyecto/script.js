const datos = {
  bluesky: {
    etiquetas: ['Criptomonedas', 'Phishing', 'Inversiones', 'Sorteos falsos', 'Suplantación'],
    valores: [312, 241, 198, 155, 120],
    detalle: {
      'Criptomonedas': { posts: '312', bot: '78%', llm: 'Alto', resumen: 'Patrón claro de bots e IA generativa. Textos con alta similitud semántica y tiempos de publicación sincronizados.' },
      'Phishing': { posts: '241', bot: '62%', llm: 'Medio', resumen: 'Mensajes con variaciones menores de una plantilla base. El 62% de cuentas muestra actividad fuera de horario normal.' },
      'Inversiones': { posts: '198', bot: '55%', llm: 'Medio', resumen: 'Esquemas amplificados por cuentas creadas en períodos breves. Lenguaje persuasivo y uniforme.' },
      'Sorteos falsos': { posts: '155', bot: '48%', llm: 'Bajo', resumen: 'Menor sofisticación técnica. Automatización básica sin evidencia fuerte de uso de LLMs.' },
      'Suplantación': { posts: '120', bot: '71%', llm: 'Alto', resumen: 'Biografías generadas por IA para parecer legítimas. Forman redes de apoyo mutuo.' }
    }
  },
  reddit: {
    etiquetas: ['Criptomonedas', 'Pump & dump', 'Fake news', 'Fraude romántico', 'Software falso'],
    valores: [287, 210, 176, 143, 98],
    detalle: {
      'Criptomonedas': { posts: '287', bot: '65%', llm: 'Medio', resumen: 'Se usan cuentas con karma acumulado para dar credibilidad.' },
      'Pump & dump': { posts: '210', bot: '82%', llm: 'Alto', resumen: 'La coordinación más sofisticada del dataset. Sincronizan publicaciones al minuto.' },
      'Fake news': { posts: '176', bot: '43%', llm: 'Medio', resumen: 'Resúmenes alterados de fuentes reales, posiblemente modificados con LLMs.' },
      'Fraude romántico': { posts: '143', bot: '38%', llm: 'Alto', resumen: 'Uso intensivo de LLMs para mantener conversaciones prolongadas con víctimas.' },
      'Software falso': { posts: '98', bot: '51%', llm: 'Bajo', resumen: 'Reviews falsas automatizadas. Menor sofisticación en IA generativa.' }
    }
  }
}

// Datos inventados para la tabla
const filasTabla = [
  { fecha: '2026-06-01', estafa: 'Criptomonedas', fuente: 'Bluesky', url: 'https://bsky.app/post/abc123' },
  { fecha: '2026-06-01', estafa: 'Phishing', fuente: 'Bluesky', url: 'https://bsky.app/post/def456' },
  { fecha: '2026-06-02', estafa: 'Pump & dump', fuente: 'Reddit', url: 'https://reddit.com/r/investing/xyz' },
  { fecha: '2026-06-02', estafa: 'Criptomonedas', fuente: 'Reddit', url: 'https://reddit.com/r/crypto/abc' },
  { fecha: '2026-06-03', estafa: 'Fake news', fuente: 'Reddit', url: 'https://reddit.com/r/news/def' },
  { fecha: '2026-06-03', estafa: 'Suplantación', fuente: 'Bluesky', url: 'https://bsky.app/post/ghi789' },
  { fecha: '2026-06-04', estafa: 'Inversiones', fuente: 'Bluesky', url: 'https://bsky.app/post/jkl012' },
  { fecha: '2026-06-04', estafa: 'Fraude romántico', fuente: 'Reddit', url: 'https://reddit.com/r/dating/mno' }
]

let plataformaActual = 'bluesky'
let miGrafico = null
let graficoPlatforma = null

// Gráfico general combinado
function construirGraficoGeneral() {
  const etiquetas = ['Criptomonedas', 'Phishing/Pump&dump', 'Inversiones/Fake news', 'Sorteos/Fraude romántico', 'Suplantación/Software falso']
  const valoresCombinados = [
    datos.bluesky.valores[0] + datos.reddit.valores[0],
    datos.bluesky.valores[1] + datos.reddit.valores[1],
    datos.bluesky.valores[2] + datos.reddit.valores[2],
    datos.bluesky.valores[3] + datos.reddit.valores[3],
    datos.bluesky.valores[4] + datos.reddit.valores[4]
  ]

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
  document.getElementById('nombre-plataforma').textContent = plataforma
  document.getElementById('vista-inicio').style.display = 'none'
  document.getElementById('vista-plataforma').style.display = 'block'
  construirGraficoPlatforma()
}

function volverInicio() {
  document.getElementById('vista-plataforma').style.display = 'none'
  document.getElementById('vista-inicio').style.display = 'block'
}

function mostrarDetalle(etiqueta) {
  abrirModal(etiqueta)
}

function abrirModal(etiqueta) {
  const d = datos[plataformaActual].detalle[etiqueta]
  document.getElementById('modal-titulo').textContent = etiqueta
  document.getElementById('modal-plataforma').textContent = plataformaActual
  document.getElementById('modal-resumen').textContent = d.resumen
  document.getElementById('modal-overlay').style.display = 'flex'
}

function cerrarModal() {
  document.getElementById('modal-overlay').style.display = 'none'
}

// Iniciar
construirGraficoGeneral()
construirTabla()