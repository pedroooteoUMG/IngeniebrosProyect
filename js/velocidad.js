// Simulación de Velocidad y Aceleración
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const funcionPosicionSelect = document.getElementById('funcion-posicion');
    const iniciarBtn = document.getElementById('iniciar-velocidad');
    const valorPosicion = document.getElementById('valor-posicion');
    const valorVelocidad = document.getElementById('valor-velocidad');
    const valorAceleracion = document.getElementById('valor-aceleracion');
    
    // Variables para la simulación
    let simulacionActiva = false;
    let tiempoActual = 0;
    let animacionId = null;
    let grafico = null;
    
    // Funciones de posición
    const funcionesPosicion = {
        lineal: {
            funcion: t => 10 * t,
            derivada: t => 10,
            segundaDerivada: t => 0,
            texto: 's(t) = 10t'
        },
        cuadratica: {
            funcion: t => 5 * t * t + 2 * t,
            derivada: t => 10 * t + 2,
            segundaDerivada: t => 10,
            texto: 's(t) = 5t² + 2t'
        },
        cubica: {
            funcion: t => Math.pow(t, 3) - 3 * Math.pow(t, 2) + 2 * t,
            derivada: t => 3 * Math.pow(t, 2) - 6 * t + 2,
            segundaDerivada: t => 6 * t - 6,
            texto: 's(t) = t³ - 3t² + 2t'
        }
    };
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-velocidad').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Posición (m)',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Velocidad (m/s)',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Aceleración (m/s²)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
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
                        title: {
                            display: true,
                            text: 'Valor'
                        }
                    }
                }
            }
        });
    }
    
    // Función para actualizar la simulación
    function actualizarSimulacion() {
        if (!simulacionActiva) return;
        
        // Obtener la función seleccionada
        const funcionSeleccionada = funcionesPosicion[funcionPosicionSelect.value];
        
        // Calcular valores
        const posicion = funcionSeleccionada.funcion(tiempoActual);
        const velocidad = funcionSeleccionada.derivada(tiempoActual);
        const aceleracion = funcionSeleccionada.segundaDerivada(tiempoActual);
        
        // Actualizar visualización
        valorPosicion.textContent = posicion.toFixed(2) + ' m';
        valorVelocidad.textContent = velocidad.toFixed(2) + ' m/s';
        valorAceleracion.textContent = aceleracion.toFixed(2) + ' m/s²';
        
        // Actualizar gráfico
        grafico.data.labels.push(tiempoActual.toFixed(1));
        grafico.data.datasets[0].data.push(posicion);
        grafico.data.datasets[1].data.push(velocidad);
        grafico.data.datasets[2].data.push(aceleracion);
        
        // Limitar el número de puntos en el gráfico para mejor rendimiento
        if (grafico.data.labels.length > 50) {
            grafico.data.labels.shift();
            grafico.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        grafico.update();
        
        // Incrementar tiempo
        tiempoActual += 0.1;
        
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
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
            
            // Iniciar simulación
            simulacionActiva = true;
            iniciarBtn.textContent = 'Detener Simulación';
            actualizarSimulacion();
        }
    });
    
    // Evento para cambiar la función
    funcionPosicionSelect.addEventListener('change', function() {
        if (simulacionActiva) {
            // Detener simulación actual
            simulacionActiva = false;
            cancelAnimationFrame(animacionId);
            iniciarBtn.textContent = 'Iniciar Simulación';
            
            // Reiniciar valores
            tiempoActual = 0;
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
        }
    });
});
