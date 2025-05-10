// Simulación de Dinámica de Poblaciones
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const poblacionInicialSlider = document.getElementById('poblacion-inicial');
    const tasaIntrinsecaSlider = document.getElementById('tasa-intrinseca');
    const capacidadCargaSlider = document.getElementById('capacidad-carga');
    const iniciarBtn = document.getElementById('iniciar-poblacion');
    const poblacionActual = document.getElementById('poblacion-actual');
    const tasaCrecimientoActual = document.getElementById('tasa-crecimiento-actual');
    const tiempoEquilibrioPoblacion = document.getElementById('tiempo-equilibrio-poblacion');
    
    // Variables para la simulación
    let simulacionActiva = false;
    let tiempoActual = 0;
    let poblacionValue = 0;
    let animacionId = null;
    let grafico = null;
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-poblacion').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Población',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Tasa de crecimiento (individuos/año)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
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
                            text: 'Tiempo (años)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Población (individuos)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tasa de crecimiento (individuos/año)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Función para calcular la tasa de crecimiento poblacional
    function calcularTasaCrecimiento(P, r, K) {
        return r * P * (1 - P / K);
    }
    
    // Función para calcular el tiempo hasta el equilibrio
    function calcularTiempoEquilibrio(P0, K, r, porcentaje = 0.99) {
        // Tiempo para que la población alcance un porcentaje de la capacidad de carga
        // Usando la solución de la ecuación logística: P(t) = K / (1 + ((K/P0) - 1) * e^(-rt))
        // Queremos P(t) > porcentaje * K
        // K / (1 + ((K/P0) - 1) * e^(-rt)) > porcentaje * K
        // 1 / (1 + ((K/P0) - 1) * e^(-rt)) > porcentaje
        // 1 + ((K/P0) - 1) * e^(-rt) < 1/porcentaje
        // ((K/P0) - 1) * e^(-rt) < 1/porcentaje - 1
        // e^(-rt) < (1/porcentaje - 1) / ((K/P0) - 1)
        // -rt < ln((1/porcentaje - 1) / ((K/P0) - 1))
        // t > -ln((1/porcentaje - 1) / ((K/P0) - 1)) / r
        
        if (P0 >= porcentaje * K) return 0;
        
        const numerador = (1/porcentaje - 1);
        const denominador = (K/P0 - 1);
        
        return -Math.log(numerador / denominador) / r;
    }
    
    // Función para actualizar la simulación
    function actualizarSimulacion() {
        if (!simulacionActiva) return;
        
        // Obtener parámetros
        const P0 = parseInt(poblacionInicialSlider.value);
        const r = parseFloat(tasaIntrinsecaSlider.value);
        const K = parseInt(capacidadCargaSlider.value);
        
        // Calcular tasa de crecimiento
        const tasa = calcularTasaCrecimiento(poblacionValue, r, K);
        
        // Actualizar población
        poblacionValue += tasa * 0.1; // Incremento proporcional al tiempo (0.1 años)
        
        // Actualizar visualización
        poblacionActual.textContent = Math.round(poblacionValue) + ' individuos';
        tasaCrecimientoActual.textContent = Math.round(tasa) + ' individuos/año';
        
        // Calcular tiempo hasta equilibrio desde el estado actual
        const tiempoHastaEquilibrio = calcularTiempoEquilibrio(poblacionValue, K, r);
        tiempoEquilibrioPoblacion.textContent = tiempoHastaEquilibrio.toFixed(1) + ' años';
        
        // Actualizar gráfico
        grafico.data.labels.push(tiempoActual.toFixed(1));
        grafico.data.datasets[0].data.push(poblacionValue);
        grafico.data.datasets[1].data.push(tasa);
        
        // Limitar el número de puntos en el gráfico para mejor rendimiento
        if (grafico.data.labels.length > 100) {
            grafico.data.labels.shift();
            grafico.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        grafico.update();
        
        // Incrementar tiempo
        tiempoActual += 0.1;
        
        // Detener si la población está muy cerca de la capacidad de carga
        if (poblacionValue > 0.99 * K) {
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
            poblacionValue = parseInt(poblacionInicialSlider.value);
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
            
            // Actualizar visualización inicial
            poblacionActual.textContent = poblacionValue + ' individuos';
            
            // Calcular tiempo hasta equilibrio inicial
            const r = parseFloat(tasaIntrinsecaSlider.value);
            const K = parseInt(capacidadCargaSlider.value);
            const tiempoHastaEquilibrio = calcularTiempoEquilibrio(poblacionValue, K, r);
            tiempoEquilibrioPoblacion.textContent = tiempoHastaEquilibrio.toFixed(1) + ' años';
            
            // Iniciar simulación
            simulacionActiva = true;
            iniciarBtn.textContent = 'Detener Simulación';
            actualizarSimulacion();
        }
    });
    
    // Eventos para actualizar los valores mostrados de los sliders
    poblacionInicialSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-poblacion-inicial');
        valorDisplay.textContent = this.value + ' individuos';
        
        // Actualizar población actual si no hay simulación en curso
        if (!simulacionActiva) {
            poblacionValue = parseInt(this.value);
            poblacionActual.textContent = poblacionValue + ' individuos';
        }
    });
    
    tasaIntrinsecaSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-tasa-intrinseca');
        valorDisplay.textContent = this.value;
    });
    
    capacidadCargaSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-capacidad-carga');
        valorDisplay.textContent = this.value + ' individuos';
    });
});
