// Datos de ejemplo
const datos = {
  bluesky: {
    etiquetas: ['Criptomonedas', 'Phishing', 'Inversiones', 'Sorteos falsos', 'Suplantación'],
    valores: [312, 241, 198, 155, 120],
    detalle: {
      'Criptomonedas': {
        posts: '312',
        bot: '78%',
        llm: 'Alto',
        resumen: 'Patrón claro de bots e IA generativa. Textos con alta similitud semántica y tiempos de publicación sincronizados.'
      },
      'Phishing': {
        posts: '241',
        bot: '62%',
        llm: 'Medio',
        resumen: 'Mensajes con variaciones menores de una plantilla base. El 62% de cuentas muestra actividad fuera de horario normal.'
      },
      'Inversiones': {
        posts: '198',
        bot: '55%',
        llm: 'Medio',
        resumen: 'Esquemas amplificados por cuentas creadas en períodos breves. Lenguaje persuasivo y uniforme.'
      },
      'Sorteos falsos': {
        posts: '155',
        bot: '48%',
        llm: 'Bajo',
        resumen: 'Menor sofisticación técnica. Automatización básica sin evidencia fuerte de uso de LLMs.'
      },
      'Suplantación': {
        posts: '120',
        bot: '71%',
        llm: 'Alto',
        resumen: 'Biografías generadas por IA para parecer legítimas. Forman redes de apoyo mutuo.'
      }
    }
  },
  reddit: {
    etiquetas: ['Criptomonedas', 'Pump & dump', 'Fake news', 'Fraude romántico', 'Software falso'],
    valores: [287, 210, 176, 143, 98],
    detalle: {
      'Criptomonedas': {
        posts: '287',
        bot: '65%',
        llm: 'Medio',
        resumen: 'Se usan cuentas con karma acumulado para dar credibilidad. Análisis con estructura coherente con LLMs.'
      },
      'Pump & dump': {
        posts: '210',
        bot: '82%',
        llm: 'Alto',
        resumen: 'La coordinación más sofisticada del dataset. Sincronizan publicaciones al minuto con argumentos financieros elaborados.'
      },
      'Fake news': {
        posts: '176',
        bot: '43%',
        llm: 'Medio',
        resumen: 'Resúmenes alterados de fuentes reales, posiblemente modificados con LLMs para mantener coherencia superficial.'
      },
      'Fraude romántico': {
        posts: '143',
        bot: '38%',
        llm: 'Alto',
        resumen: 'Uso intensivo de LLMs para mantener conversaciones prolongadas y personalizadas con víctimas.'
      },
      'Software falso': {
        posts: '98',
        bot: '51%',
        llm: 'Bajo',
        resumen: 'Reviews falsas automatizadas. Menor sofisticación en IA generativa pero riesgo técnico relevante.'
      }
    }
  }
}

let plataformaActual = 'bluesky'
let miGrafico = null

function construirGrafico() {
  const d = datos[plataformaActual]
  const ctx = document.getElementById('mi-grafico').getContext('2d')

  if (miGrafico) miGrafico.destroy()

  miGrafico = new Chart(ctx, {
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
  construirGrafico()
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
function cambiarPlataforma(plataforma) {
  plataformaActual = plataforma
  document.getElementById('nombre-plataforma').textContent = plataforma

  // Actualizar botón activo
  document.querySelectorAll('.btn-plataforma').forEach(b => b.classList.remove('activo'))
  document.getElementById('btn-' + plataforma).classList.add('activo')

  construirGrafico()
}
construirGrafico()