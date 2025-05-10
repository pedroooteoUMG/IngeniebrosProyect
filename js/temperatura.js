// Simulación de Control de Temperatura
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const tempInicialSlider = document.getElementById('temp-inicial');
    const tempAmbienteSlider = document.getElementById('temp-ambiente');
    const constanteKSlider = document.getElementById('constante-k');
    const iniciarBtn = document.getElementById('iniciar-temperatura');
    const tempActual = document.getElementById('temp-actual');
    const tasaTemperatura = document.getElementById('tasa-temperatura');
    const tiempoEquilibrio = document.getElementById('tiempo-equilibrio');
    
    // Variables para la simulación
    let simulacionActiva = false;
    let tiempoActual = 0;
    let temperaturaActual = parseFloat(tempInicialSlider.value);
    let animacionId = null;
    let grafico = null;
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-temperatura').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Tasa de cambio (°C/min)',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
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
                            text: 'Tiempo (min)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tasa de cambio (°C/min)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Función para calcular la tasa de cambio de la temperatura
    function calcularTasaTemperatura(T, Ta, k) {
        return k * (Ta - T);
    }
    
    // Función para calcular el tiempo hasta el equilibrio
    function calcularTiempoEquilibrio(T0, Ta, k, tolerancia = 0.1) {
        // Tiempo para que la diferencia sea menor que la tolerancia
        // Usando la solución de la ecuación diferencial: T(t) = Ta + (T0 - Ta) * e^(-kt)
        // Queremos |T(t) - Ta| < tolerancia
        // |T0 - Ta| * e^(-kt) < tolerancia
        // e^(-kt) < tolerancia / |T0 - Ta|
        // -kt < ln(tolerancia / |T0 - Ta|)
        // t > -ln(tolerancia / |T0 - Ta|) / k
        
        const diferencia = Math.abs(T0 - Ta);
        if (diferencia < tolerancia) return 0;
        
        return -Math.log(tolerancia / diferencia) / k;
    }
    
    // Función para actualizar la simulación
    function actualizarSimulacion() {
        if (!simulacionActiva) return;
        
        // Obtener parámetros
        const tempInicial = parseFloat(tempInicialSlider.value);
        const tempAmbiente = parseFloat(tempAmbienteSlider.value);
        const k = parseFloat(constanteKSlider.value);
        
        // Calcular tasa de cambio
        const tasa = calcularTasaTemperatura(temperaturaActual, tempAmbiente, k);
        
        // Actualizar temperatura
        temperaturaActual += tasa * 0.1; // Incremento proporcional al tiempo (0.1 min)
        
        // Actualizar visualización
        tempActual.textContent = temperaturaActual.toFixed(2) + '°C';
        tasaTemperatura.textContent = tasa.toFixed(2) + '°C/min';
        
        // Calcular tiempo hasta equilibrio desde el estado actual
        const tiempoHastaEquilibrio = calcularTiempoEquilibrio(temperaturaActual, tempAmbiente, k);
        tiempoEquilibrio.textContent = tiempoHastaEquilibrio.toFixed(1) + ' min';
        
        // Actualizar gráfico
        grafico.data.labels.push(tiempoActual.toFixed(1));
        grafico.data.datasets[0].data.push(temperaturaActual);
        grafico.data.datasets[1].data.push(tasa);
        
        // Limitar el número de puntos en el gráfico para mejor rendimiento
        if (grafico.data.labels.length > 100) {
            grafico.data.labels.shift();
            grafico.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        grafico.update();
        
        // Incrementar tiempo
        tiempoActual += 0.1;
        
        // Detener si la temperatura está muy cerca del equilibrio
        if (Math.abs(temperaturaActual - tempAmbiente) < 0.1) {
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
            temperaturaActual = parseFloat(tempInicialSlider.value);
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
            
            // Actualizar visualización inicial
            tempActual.textContent = temperaturaActual.toFixed(2) + '°C';
            
            // Calcular tiempo hasta equilibrio inicial
            const tempAmbiente = parseFloat(tempAmbienteSlider.value);
            const k = parseFloat(constanteKSlider.value);
            const tiempoHastaEquilibrio = calcularTiempoEquilibrio(temperaturaActual, tempAmbiente, k);
            tiempoEquilibrio.textContent = tiempoHastaEquilibrio.toFixed(1) + ' min';
            
            // Iniciar simulación
            simulacionActiva = true;
            iniciarBtn.textContent = 'Detener Simulación';
            actualizarSimulacion();
        }
    });
    
    // Eventos para actualizar los valores mostrados de los sliders
    tempInicialSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-temp-inicial');
        valorDisplay.textContent = this.value + '°C';
        
        // Actualizar temperatura actual si no hay simulación en curso
        if (!simulacionActiva) {
            temperaturaActual = parseFloat(this.value);
            tempActual.textContent = temperaturaActual.toFixed(2) + '°C';
        }
    });
    
    tempAmbienteSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-temp-ambiente');
        valorDisplay.textContent = this.value + '°C';
    });
    
    constanteKSlider.addEventListener('input', function() {
        const valorDisplay = document.getElementById('valor-constante-k');
        valorDisplay.textContent = this.value;
    });
});
