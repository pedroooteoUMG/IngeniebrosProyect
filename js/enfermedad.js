// Simulación de Propagación de una Enfermedad
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const poblacionTotalInput = document.getElementById('poblacion-total-input');
    const tasaCrecimientoInput = document.getElementById('tasa-crecimiento-input');
    const infectadosInicialesInput = document.getElementById('infectados-iniciales-input');
    const duracionSimulacionInput = document.getElementById('duracion-simulacion');
    const iniciarBtn = document.getElementById('iniciar-enfermedad');
    const infectadosActuales = document.getElementById('infectados-actuales');
    const tasaContagio = document.getElementById('tasa-contagio');
    const tiempoPico = document.getElementById('tiempo-pico');
    const porcentajeInfectado = document.getElementById('porcentaje-infectado');
    
    // Variables para la simulación
    let simulacionActiva = false;
    let tiempoActual = 0;
    let animacionId = null;
    let grafico = null;
    let tiempoHastaPico = null;
    let duracionMaxima = 60; // Valor predeterminado
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-enfermedad').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Infectados',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Tasa de contagio (personas/día)',
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
                            text: 'Tiempo (días)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Número de infectados'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tasa de contagio (personas/día)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Función para calcular el número de infectados según el modelo logístico
    function calcularInfectados(t, I0, K, r) {
        const A = (K - I0) / I0;
        return K / (1 + A * Math.exp(-r * t));
    }
    
    // Función para calcular la tasa de contagio
    function calcularTasaContagio(I, K, r) {
        return r * I * (1 - I / K);
    }
    
    // Función para calcular el tiempo hasta el pico de contagios
    function calcularTiempoPico(I0, K, r) {
        const A = (K - I0) / I0;
        return Math.log(A) / r;
    }
    
    // Función para actualizar la simulación
    function actualizarSimulacion() {
        if (!simulacionActiva) return;
        
        // Obtener parámetros
        const K = parseInt(poblacionTotalInput.value);
        const r = parseFloat(tasaCrecimientoInput.value);
        const I0 = parseInt(infectadosInicialesInput.value);
        duracionMaxima = parseInt(duracionSimulacionInput.value);
        
        // Calcular valores actuales
        const I = calcularInfectados(tiempoActual, I0, K, r);
        const tasa = calcularTasaContagio(I, K, r);
        const porcentaje = (I / K) * 100;
        
        // Actualizar visualización
        infectadosActuales.textContent = Math.round(I) + ' personas';
        tasaContagio.textContent = Math.round(tasa) + ' personas/día';
        porcentajeInfectado.textContent = porcentaje.toFixed(2) + '%';
        
        if (tiempoHastaPico === null) {
            tiempoHastaPico = calcularTiempoPico(I0, K, r);
            tiempoPico.textContent = tiempoHastaPico.toFixed(1) + ' días';
        }
        
        // Actualizar gráfico
        grafico.data.labels.push(tiempoActual.toFixed(1));
        grafico.data.datasets[0].data.push(I);
        grafico.data.datasets[1].data.push(tasa);
        
        // Limitar el número de puntos en el gráfico para mejor rendimiento
        if (grafico.data.labels.length > 100) {
            grafico.data.labels.shift();
            grafico.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        grafico.update();
        
        // Incrementar tiempo
        tiempoActual += 0.2;
        
        // Detener si la epidemia ha alcanzado su estado estable o se ha superado la duración máxima
        if (tiempoActual > duracionMaxima) {
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
            tiempoHastaPico = null;
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
            
            // Iniciar simulación
            simulacionActiva = true;
            iniciarBtn.textContent = 'Detener Simulación';
            actualizarSimulacion();
        }
    });
    
    // Validación de los campos de entrada
    poblacionTotalInput.addEventListener('change', function() {
        if (parseInt(this.value) < parseInt(this.min)) {
            this.value = this.min;
        } else if (parseInt(this.value) > parseInt(this.max)) {
            this.value = this.max;
        }
    });
    
    tasaCrecimientoInput.addEventListener('change', function() {
        if (parseFloat(this.value) < parseFloat(this.min)) {
            this.value = this.min;
        } else if (parseFloat(this.value) > parseFloat(this.max)) {
            this.value = this.max;
        }
    });
    
    infectadosInicialesInput.addEventListener('change', function() {
        if (parseInt(this.value) < parseInt(this.min)) {
            this.value = this.min;
        } else if (parseInt(this.value) > parseInt(this.max)) {
            this.value = this.max;
        }
        
        // Validar que los infectados iniciales no sean mayores que la población total
        const poblacionTotal = parseInt(poblacionTotalInput.value);
        if (parseInt(this.value) > poblacionTotal) {
            this.value = poblacionTotal;
            alert('El número de infectados iniciales no puede ser mayor que la población total.');
        }
    });
    
    duracionSimulacionInput.addEventListener('change', function() {
        if (parseInt(this.value) < parseInt(this.min)) {
            this.value = this.min;
        } else if (parseInt(this.value) > parseInt(this.max)) {
            this.value = this.max;
        }
    });
    
    // Validar que los infectados iniciales no sean mayores que la población total cuando cambia la población
    poblacionTotalInput.addEventListener('change', function() {
        const infectadosIniciales = parseInt(infectadosInicialesInput.value);
        if (infectadosIniciales > parseInt(this.value)) {
            infectadosInicialesInput.value = this.value;
            alert('El número de infectados iniciales no puede ser mayor que la población total.');
        }
    });
});
