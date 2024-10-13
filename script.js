// Cargar y procesar los datos desde el archivo JSON
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Lista de países a incluir en el gráfico (sin Venezuela)
        const selectedCountries = ['CHL', 'ARG', 'BRA', 'URY', 'PER', 'MEX', 'NIC', 'CUB'];
        const allCountries = Object.keys(data);
        const years = [];
        const countryData = {};
        const averageData = {};

        // Inicializar averageData para acumular porcentajes de todos los países
        allCountries.forEach(countryCode => {
            data[countryCode].data.forEach(entry => {
                // Solo considerar los años entre 2000 y 2021
                if (entry.year >= 2000 && entry.year <= 2021) {
                    if (!averageData[entry.year]) {
                        averageData[entry.year] = {
                            total: 0,
                            count: 0
                        };
                    }
                    averageData[entry.year].total += entry.internet_users_percentage;
                    averageData[entry.year].count += 1;

                    if (!years.includes(entry.year)) {
                        years.push(entry.year);
                    }
                }
            });
        });

        // Calcular el promedio por año
        const averageYears = [];
        const averagePercentages = [];
        years.sort((a, b) => a - b);

        years.forEach(year => {
            averageYears.push(year);
            const avg = averageData[year].total / averageData[year].count;
            averagePercentages.push(avg);
        });

        // Filtrar y procesar solo los países seleccionados
        selectedCountries.forEach(countryCode => {
            countryData[countryCode] = {
                name: data[countryCode].country_name,
                years: [],
                internet_users_percentage: []
            };

            data[countryCode].data.forEach(entry => {
                if (entry.year >= 2000 && entry.year <= 2021) {
                    countryData[countryCode].years.push(entry.year);
                    countryData[countryCode].internet_users_percentage.push(entry.internet_users_percentage);
                }
            });
        });

        // Configurar la visualización con Plotly.js
        const traces = [];
        const colors = {
            'CHL': '#FF0000', // Rojo para Chile
            'ARG': '#1f77b4',
            'BRA': '#ff7f0e',
            'URY': '#2ca02c',
            'PER': '#d62728',
            'MEX': '#9467bd',
            'NIC': '#e377c2',
            'CUB': '#7f7f7f'
        };

        // Generar una línea por cada país seleccionado
        selectedCountries.forEach(countryCode => {
            const trace = {
                x: countryData[countryCode].years,
                y: countryData[countryCode].internet_users_percentage,
                mode: 'lines+markers',
                name: countryData[countryCode].name,
                line: {
                    width: countryData[countryCode].name === 'Chile' ? 6 : 2, // Mayor grosor para Chile
                    color: colors[countryCode]
                },
                hoverinfo: 'name+y'
            };
            traces.push(trace);
        });

        // Agregar la línea del promedio
        const averageTrace = {
            x: averageYears,
            y: averagePercentages,
            mode: 'lines+markers',
            name: 'Promedio América Latina',
            line: {
                width: 5, // Mayor grosor para el promedio
                color: '#000000', // Negra para el promedio
                dash: 'dash' // Rayada
            },
            hoverinfo: 'name+y'
        };
        traces.push(averageTrace);

        // Configurar layout
const layout = {
    title: 'Porcentaje de Población con Acceso a Internet en América Latina (2000-2021)',
    xaxis: {
        title: 'Año',
        tickmode: 'linear',
        tick0: 2000,
        dtick: 1,
        range: [2000, 2021]
    },
    yaxis: {
        title: 'Porcentaje de Usuarios de Internet (%)',
        range: [0, 100]
    },
    legend: {
        x: 1,
        y: 1,
        title: {
            text: 'Países'
        }
    },
    annotations: [
        {
            x: 2002,
            y: 22.5,
            xref: 'x',
            yref: 'y',
            text: 'Chile dominaba el acceso a internet al principio del siglo',
            showarrow: true,
            arrowhead: 6,
            ax: 30,
            ay: -80,
            font: {
                color: '#000000',
                size: 12
            },
            bgcolor: '#ffffff'
        },
        {
            x: 2014,
            y: 61,
            xref: 'x',
            yref: 'y',
            text: 'Implementación del 4G',
            showarrow: true,
            arrowhead: 6,
            ax: -20,
            ay: -50,
            font: {
                color: '#000000',
                size: 12
            },
            bgcolor: '#ffffff'
        }

    ]
};

        // Renderizar la gráfica, poniendo a Chile y al promedio al frente
        traces.push(traces.shift()); // Mover la traza de Chile al frente
        traces.push(traces.pop()); // Mover la traza del promedio al frente

        Plotly.newPlot('chart', traces, layout);
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
    });
