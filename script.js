// Cargar y procesar los datos desde el archivo JSON
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const countries = Object.keys(data);
        const years = [];
        const countryData = {};
        
        // Procesar la información
        countries.forEach(countryCode => {
            countryData[countryCode] = {
                name: data[countryCode].country_name,
                years: [],
                internet_users_percentage: []
            };

            data[countryCode].data.forEach(entry => {
                if (!years.includes(entry.year)) {
                    years.push(entry.year);
                }
                countryData[countryCode].years.push(entry.year);
                countryData[countryCode].internet_users_percentage.push(entry.internet_users_percentage);
            });
        });

        // Ordenar los años para asegurar una visualización correcta
        years.sort((a, b) => a - b);

        // Configurar la visualización con Plotly.js
        const traces = [];

        // Generar una línea por cada país
        countries.forEach(countryCode => {
            const trace = {
                x: countryData[countryCode].years,
                y: countryData[countryCode].internet_users_percentage,
                mode: 'lines+markers',
                name: countryData[countryCode].name,
                line: {
                    width: countryData[countryCode].name === 'Chile' ? 4 : 2,
                    color: countryData[countryCode].name === 'Chile' ? '#FF5733' : '#007bff',
                    dash: countryData[countryCode].name === 'Chile' ? 'solid' : 'dot'
                }
            };
            traces.push(trace);
        });

        // Configurar layout
        const layout = {
            title: 'Porcentaje de Población con Acceso a Internet en América Latina (2000-2021)',
            xaxis: {
                title: 'Año',
                tickmode: 'linear',
                tick0: years[0],
                dtick: 1
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
            }
        };

        // Renderizar la gráfica
        Plotly.newPlot('chart', traces, layout);
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
    });
