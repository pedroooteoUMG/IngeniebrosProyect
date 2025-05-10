// Funciones de utilidad general
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar MathJax
    if (typeof MathJax !== 'undefined') {
        MathJax.Hub?.Queue(["Typeset", MathJax.Hub]);
    }

    // Navbar interactivo
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle del menú en dispositivos móviles
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active') && 
            !e.target.closest('.nav-container')) {
            navMenu.classList.remove('active');
        }
    });
    
    // Marcar enlace activo según la sección visible
    function setActiveNavLink() {
        const sections = document.querySelectorAll('section');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    // Actualizar enlace activo al desplazarse
    window.addEventListener('scroll', setActiveNavLink);
    
    // Inicializar el enlace activo
    setActiveNavLink();
    
    // Scroll suave para los enlaces de navegación
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil después de hacer clic en un enlace
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Inicializar todos los sliders para mostrar sus valores
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const valueDisplay = document.getElementById(`valor-${slider.id}`);
        if (valueDisplay) {
            // Actualizar el valor inicial
            updateSliderValue(slider, valueDisplay);
            
            // Actualizar cuando cambie
            slider.addEventListener('input', function() {
                updateSliderValue(this, valueDisplay);
            });
        }
    });
});

// Función para actualizar el valor mostrado de un slider
function updateSliderValue(slider, display) {
    let suffix = '';
    
    // Determinar el sufijo basado en el ID del slider
    if (slider.id.includes('velocidad')) suffix = ' m/s';
    else if (slider.id.includes('tasa-inflado')) suffix = ' cm/s';
    else if (slider.id.includes('poblacion')) suffix = ' personas';
    else if (slider.id.includes('temp')) suffix = '°C';
    else if (slider.id.includes('capacidad')) suffix = ' individuos';
    else if (slider.id.includes('infectados')) suffix = ' personas';
    
    display.textContent = slider.value + suffix;
}

// Función para formatear números con separadores de miles
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Función para generar colores aleatorios para gráficos
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Función para crear un gráfico básico con Chart.js
function createChart(canvasId, type, labels, datasets, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Opciones predeterminadas
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Tiempo'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Valor'
                }
            }
        }
    };
    
    // Combinar opciones predeterminadas con las proporcionadas
    const chartOptions = {...defaultOptions, ...options};
    
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: chartOptions
    });
}

// Función para actualizar un gráfico existente
function updateChart(chart, labels, datasets) {
    chart.data.labels = labels;
    
    // Actualizar cada conjunto de datos
    datasets.forEach((dataset, index) => {
        if (chart.data.datasets[index]) {
            chart.data.datasets[index].data = dataset.data;
        } else {
            chart.data.datasets.push(dataset);
        }
    });
    
    chart.update();
}

// Función para calcular la derivada numérica
function numericalDerivative(func, x, h = 0.0001) {
    return (func(x + h) - func(x)) / h;
}

// Función para calcular la segunda derivada numérica
function secondDerivative(func, x, h = 0.0001) {
    return (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);
}

// Función para resolver ecuaciones numéricamente (método de Newton-Raphson)
function solveEquation(func, derivative, initialGuess, tolerance = 0.0001, maxIterations = 100) {
    let x = initialGuess;
    let iteration = 0;
    
    while (Math.abs(func(x)) > tolerance && iteration < maxIterations) {
        x = x - func(x) / derivative(x);
        iteration++;
    }
    
    return x;
}
