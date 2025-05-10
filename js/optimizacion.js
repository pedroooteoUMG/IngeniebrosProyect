// Simulación de Optimización de la Producción
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const funcionCostoSelect = document.getElementById('funcion-costo');
    const funcionIngresoSelect = document.getElementById('funcion-ingreso');
    const calcularBtn = document.getElementById('calcular-optimizacion');
    const cantidadOptima = document.getElementById('cantidad-optima');
    const costoTotal = document.getElementById('costo-total');
    const ingresoTotal = document.getElementById('ingreso-total');
    const ganancia = document.getElementById('ganancia');
    
    // Variables para la simulación
    let grafico = null;
    
    // Funciones de costo
    const funcionesCosto = {
        cuadratica: {
            funcion: q => 0.01 * q * q + 5 * q + 100,
            derivada: q => 0.02 * q + 5,
            texto: 'C(q) = 0.01q² + 5q + 100'
        },
        cubica: {
            funcion: q => 0.001 * Math.pow(q, 3) - 0.1 * q * q + 10 * q + 200,
            derivada: q => 0.003 * Math.pow(q, 2) - 0.2 * q + 10,
            texto: 'C(q) = 0.001q³ - 0.1q² + 10q + 200'
        }
    };
    
    // Funciones de ingreso
    const funcionesIngreso = {
        lineal: {
            funcion: q => 20 * q,
            derivada: q => 20,
            texto: 'R(q) = 20q'
        },
        cuadratica: {
            funcion: q => -0.05 * q * q + 30 * q,
            derivada: q => -0.1 * q + 30,
            texto: 'R(q) = -0.05q² + 30q'
        }
    };
    
    // Inicializar el gráfico
    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-optimizacion').getContext('2d');
        
        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Costo Total',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Ingreso Total',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Ganancia',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Costo Marginal',
                        data: [],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        hidden: true
                    },
                    {
                        label: 'Ingreso Marginal',
                        data: [],
                        borderColor: '#9b59b6',
                        backgroundColor: 'rgba(155, 89, 182, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        hidden: true
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
                            text: 'Cantidad (unidades)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor ($)'
                        }
                    }
                }
            }
        });
    }
    
    // Función para encontrar el punto óptimo
    function encontrarPuntoOptimo(funcionCosto, funcionIngreso) {
        // Función cuya raíz queremos encontrar (ingreso marginal = costo marginal)
        const funcionDiferencia = q => funcionIngreso.derivada(q) - funcionCosto.derivada(q);
        
        // Derivada de la función diferencia
        const derivadaFuncionDiferencia = q => {
            // Aproximación numérica de la derivada
            const h = 0.0001;
            return (funcionDiferencia(q + h) - funcionDiferencia(q)) / h;
        };
        
        // Usar el método de Newton-Raphson para encontrar la raíz
        let q = 100; // Valor inicial
        const maxIteraciones = 100;
        const tolerancia = 0.0001;
        
        for (let i = 0; i < maxIteraciones; i++) {
            const fq = funcionDiferencia(q);
            
            if (Math.abs(fq) < tolerancia) {
                break;
            }
            
            const dfq = derivadaFuncionDiferencia(q);
            
            // Evitar división por cero
            if (Math.abs(dfq) < 1e-10) {
                break;
            }
            
            q = q - fq / dfq;
            
            // Asegurarse de que q sea positivo
            if (q < 0) q = 0;
        }
        
        return Math.round(q);
    }
    
    // Función para actualizar el gráfico
    function actualizarGrafico(funcionCosto, funcionIngreso, qOptimo) {
        // Generar datos para el gráfico
        const labels = [];
        const costoData = [];
        const ingresoData = [];
        const gananciaData = [];
        const costoMarginalData = [];
        const ingresoMarginalData = [];
        
        // Rango de cantidades para el gráfico
        const qMax = Math.max(qOptimo * 2, 200);
        const paso = Math.max(1, Math.floor(qMax / 50));
        
        for (let q = 0; q <= qMax; q += paso) {
            const costo = funcionCosto.funcion(q);
            const ingreso = funcionIngreso.funcion(q);
            
            labels.push(q);
            costoData.push(costo);
            ingresoData.push(ingreso);
            gananciaData.push(ingreso - costo);
            
            // Datos marginales
            if (q > 0) {
                costoMarginalData.push(funcionCosto.derivada(q));
                ingresoMarginalData.push(funcionIngreso.derivada(q));
            } else {
                costoMarginalData.push(null);
                ingresoMarginalData.push(null);
            }
        }
        
        // Actualizar datos del gráfico
        grafico.data.labels = labels;
        grafico.data.datasets[0].data = costoData;
        grafico.data.datasets[1].data = ingresoData;
        grafico.data.datasets[2].data = gananciaData;
        grafico.data.datasets[3].data = costoMarginalData;
        grafico.data.datasets[4].data = ingresoMarginalData;
        
        grafico.update();
    }
    
    // Inicializar gráfico al cargar
    inicializarGrafico();
    
    // Evento para calcular el punto óptimo
    calcularBtn.addEventListener('click', function() {
        // Obtener las funciones seleccionadas
        const funcionCosto = funcionesCosto[funcionCostoSelect.value];
        const funcionIngreso = funcionesIngreso[funcionIngresoSelect.value];
        
        // Encontrar el punto óptimo
        const qOptimo = encontrarPuntoOptimo(funcionCosto, funcionIngreso);
        
        // Calcular valores en el punto óptimo
        const costoEnOptimo = funcionCosto.funcion(qOptimo);
        const ingresoEnOptimo = funcionIngreso.funcion(qOptimo);
        const gananciaEnOptimo = ingresoEnOptimo - costoEnOptimo;
        
        // Actualizar visualización
        cantidadOptima.textContent = qOptimo + ' unidades';
        costoTotal.textContent = '$' + costoEnOptimo.toFixed(2);
        ingresoTotal.textContent = '$' + ingresoEnOptimo.toFixed(2);
        ganancia.textContent = '$' + gananciaEnOptimo.toFixed(2);
        
        // Actualizar gráfico
        actualizarGrafico(funcionCosto, funcionIngreso, qOptimo);
    });
    
    // Calcular punto óptimo al cargar la página
    calcularBtn.click();
});
