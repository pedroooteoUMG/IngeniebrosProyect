// Simulación de Movimiento usando el Teorema de Pitágoras
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const velocidadBarcoSlider = document.getElementById('velocidad-barco');
    const velocidadObservadorSlider = document.getElementById('velocidad-observador');
    const iniciarBtn = document.getElementById('iniciar-pitagoras');
    const distanciaX = document.getElementById('distancia-x');
    const posicionY = document.getElementById('posicion-y');
    const distanciaTotal = document.getElementById('distancia-total');
    const tasaDistancia = document.getElementById('tasa-distancia');
    const pitagorasAnimacion = document.getElementById('pitagoras-animacion');
    
    // Variables para la simulación
    let simulacionActiva = false;
    let tiempoActual = 0;
    let posicionXBarco = 0;
    let posicionYObservador = 0;
    let animacionId = null;
    let grafico = null;
    
    // Crear elementos visuales
    const barco = document.createElement('div');
    barco.style.position = 'absolute';
    barco.style.width = '20px';
    barco.style.height = '20px';
    barco.style.backgroundColor = '#3498db';
    barco.style.borderRadius = '50%';
    barco.style.left = '150px';
    barco.style.top = '150px';
    
    const observador = document.createElement('div');
    observador.style.position = 'absolute';
    observador.style.width = '20px';
    observador.style.height = '20px';
    observador.style.backgroundColor = '#e74c3c';
    observador.style.borderRadius = '50%';
    observador.style.left = '150px';
    observador.style.top = '280px';
    
    const linea = document.createElement('div');
    linea.style.position = 'absolute';
    linea.style.height = '2px';
    linea.style.backgroundColor = '#2ecc71';
    linea.style.transformOrigin = 'left center';
    
    // Agregar elementos al contenedor
    pitagorasAnimacion.appendChild(barco);
    pitagorasAnimacion.appendChild(observador);
    pitagorasAnimacion.appendChild(linea);
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-pitagoras').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Distancia barco-costa (m)',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Posición del observador (m)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Distancia total (m)',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Tasa de cambio de la distancia (m/s)',
                        data: [],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.2)',
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
                            text: 'Distancia (m)'
                        }
                    }
                }
            }
        });
    }
    
    // Función para calcular la distancia usando Pitágoras
    function calcularDistancia(x, y) {
        return Math.sqrt(x * x + y * y);
    }
    
    // Función para calcular la tasa de cambio de la distancia
    function calcularTasaDistancia(x, y, dx, dy, d) {
        return (x * dx + y * dy) / d;
    }
    
    // Función para actualizar la simulación
    function actualizarSimulacion() {
        if (!simulacionActiva) return;
        
        // Obtener velocidades
        const velocidadBarco = parseFloat(velocidadBarcoSlider.value);
        const velocidadObservador = parseFloat(velocidadObservadorSlider.value);
        
        // Actualizar posiciones
        posicionXBarco += velocidadBarco * 0.1; // Incremento proporcional al tiempo (0.1s)
        posicionYObservador += velocidadObservador * 0.1;
        
        // Calcular distancia y tasa de cambio
        const distancia = calcularDistancia(posicionXBarco, posicionYObservador);
        const tasaCambioDistancia = calcularTasaDistancia(
            posicionXBarco, posicionYObservador, 
            velocidadBarco, velocidadObservador, 
            distancia
        );
        
        // Actualizar visualización
        distanciaX.textContent = posicionXBarco.toFixed(2) + ' m';
        posicionY.textContent = posicionYObservador.toFixed(2) + ' m';
        distanciaTotal.textContent = distancia.toFixed(2) + ' m';
        tasaDistancia.textContent = tasaCambioDistancia.toFixed(2) + ' m/s';
        
        // Actualizar animación
        // Escalar para que quepa en la visualización (factor 5)
        const escala = 5;
        barco.style.left = (150 + posicionXBarco / escala) + 'px';
        observador.style.left = '150px';
        observador.style.top = (280 - posicionYObservador / escala) + 'px';
        
        // Actualizar línea
        const dx = (posicionXBarco / escala);
        const dy = (280 - posicionYObservador / escala) - 150;
        const longitud = Math.sqrt(dx * dx + dy * dy);
        const angulo = Math.atan2(dy, dx) * (180 / Math.PI);
        
        linea.style.width = longitud + 'px';
        linea.style.left = '150px';
        linea.style.top = '150px';
        linea.style.transform = `rotate(${angulo}deg)`;
        
        // Actualizar gráfico
        grafico.data.labels.push(tiempoActual.toFixed(1));
        grafico.data.datasets[0].data.push(posicionXBarco);
        grafico.data.datasets[1].data.push(posicionYObservador);
        grafico.data.datasets[2].data.push(distancia);
        grafico.data.datasets[3].data.push(tasaCambioDistancia);
        
        // Limitar el número de puntos en el gráfico para mejor rendimiento
        if (grafico.data.labels.length > 50) {
            grafico.data.labels.shift();
            grafico.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        grafico.update();
        
        // Incrementar tiempo
        tiempoActual += 0.1;
        
        // Detener si el barco se aleja demasiado
        if (posicionXBarco > 100 || posicionYObservador > 100) {
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
            posicionXBarco = 0;
            posicionYObservador = 0;
            grafico.data.labels = [];
            grafico.data.datasets.forEach(dataset => dataset.data = []);
            grafico.update();
            
            // Reiniciar posiciones
            barco.style.left = '150px';
            barco.style.top = '150px';
            observador.style.left = '150px';
            observador.style.top = '280px';
            linea.style.width = '130px';
            linea.style.transform = 'rotate(90deg)';
            
            // Iniciar simulación
            simulacionActiva = true;
            iniciarBtn.textContent = 'Detener Simulación';
            actualizarSimulacion();
        }
    });
});
