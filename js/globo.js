// Simulación de Expansión de un Globo
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const tasaInfladoSlider = document.getElementById('tasa-inflado');
    const iniciarBtn = document.getElementById('iniciar-globo');
    const valorRadio = document.getElementById('valor-radio');
    const valorVolumen = document.getElementById('valor-volumen');
    const tasaVolumen = document.getElementById('tasa-volumen');
    const globoAnimacion = document.getElementById('globo-animacion');
    
    // Variables para la simulación
    let simulacionActiva = false;
    let tiempoActual = 0;
    let radioActual = 0;
    let animacionId = null;
    let grafico = null;
    
    // Constantes
    const PI = Math.PI;
    
    // Crear elemento visual del globo
    const globoElemento = document.createElement('div');
    globoElemento.className = 'globo';
    globoAnimacion.appendChild(globoElemento);
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-globo').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Radio (cm)',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Volumen (cm³)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Tasa de cambio del volumen (cm³/s)',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo (s)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Radio (cm)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Volumen (cm³) / Tasa (cm³/s)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Función para calcular el volumen de una esfera
    function calcularVolumen(radio) {
        return (4/3) * PI * Math.pow(radio, 3);
    }
    
    // Función para calcular la tasa de cambio del volumen
    function calcularTasaVolumen(radio, tasaRadio) {
        return 4 * PI * Math.pow(radio, 2) * tasaRadio;
    }
    
    // Función para actualizar la simulación
    function actualizarSimulacion() {
        if (!simulacionActiva) return;
        
        // Obtener la tasa de inflado
        const tasaRadio = parseFloat(tasaInfladoSlider.value);
        
        // Actualizar radio
        radioActual += tasaRadio * 0.1; // Incremento proporcional al tiempo (0.1s)
        
        // Calcular volumen y tasa de cambio
        const volumen = calcularVolumen(radioActual);
        const tasaCambioVolumen = calcularTasaVolumen(radioActual, tasaRadio);
        
        // Actualizar visualización
        valorRadio.textContent = radioActual.toFixed(2) + ' cm';
        valorVolumen.textContent = volumen.toFixed(2) + ' cm³';
        tasaVolumen.textContent = tasaCambioVolumen.toFixed(2) + ' cm³/s';
        
        // Actualizar animación del globo
        const tamanoGlobo = Math.min(50 + radioActual * 10, 280); // Limitar tamaño máximo
        globoElemento.style.width = tamanoGlobo + 'px';
        globoElemento.style.height = tamanoGlobo + 'px';
        
        // Actualizar gráfico
        grafico.data.labels.push(tiempoActual.toFixed(1));
        grafico.data.datasets[0].data.push(radioActual);
        grafico.data.datasets[1].data.push(volumen);
        grafico.data.datasets[2].data.push(tasaCambioVolumen);
        
        // Limitar el número de puntos en el gráfico para mejor rendimiento
        if (grafico.data.labels.length > 50) {
            grafico.data.labels.shift();
            grafico.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        grafico.update();
        
        // Incrementar tiempo
        tiempoActual += 0.1;
        
        // Detener si el globo se hace demasiado grande
        if (radioActual > 30) {
            simulacionActiva = false;
            cancelAnimationFrame(animacionId);
            iniciarBtn.textContent = 'Iniciar Simulación';
            return;
        }
        
        // Continuar la animación
        animacionId = requestAnimationFrame(actualizarSimulacion);
    }
    
    // Inicializar gráfico al cargar
    inicializarGrafico();
    
    // Evento para iniciar/detener la simulación
    iniciarBtn.addEventListener('click', function() {
        if (simulacionActiva) {
            // Detener simulación
            simulacionActiva = false;
            cancelAnimationFrame(animacionId);
            iniciarBtn.textContent = 'Iniciar Simulación';
        } else {
            // Reiniciar valores
            tiempoActual = 0;
            radioActual = 0;
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
            
            // Reiniciar tamaño del globo
            globoElemento.style.width = '50px';
            globoElemento.style.height = '50px';
            
            // Iniciar simulación
            simulacionActiva = true;
            iniciarBtn.textContent = 'Detener Simulación';
            actualizarSimulacion();
        }
    });
    
    // Evento para cambiar la tasa de inflado
    tasaInfladoSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-tasa-inflado');
        valorDisplay.textContent = this.value + ' cm/s';
    });
});
