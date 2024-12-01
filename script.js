fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const selectedCountries = ['CHL', 'ARG', 'BRA', 'URY', 'PER', 'MEX', 'NIC', 'CUB', 'COL', 'CRI', 'DOM', 'ECU', 'GTM', 'HND', 'PAN', 'PRY', 'SLV', 'VEN'];
        const allCountries = Object.keys(data);
        const years = [];
        const countryData = {};
        const averageData = {};

        allCountries.forEach(countryCode => {
            data[countryCode].data.forEach(entry => {
                if (entry.year >= 2000 && entry.year <= 2021) {
                    if (!averageData[entry.year]) {
                        averageData[entry.year] = { total: 0, count: 0 };
                    }
                    averageData[entry.year].total += entry.internet_users_percentage;
                    averageData[entry.year].count += 1;

                    if (!years.includes(entry.year)) {
                        years.push(entry.year);
                    }
                }
            });
        });

        const averageYears = [];
        const averagePercentages = [];
        years.sort((a, b) => a - b);

        years.forEach(year => {
            averageYears.push(year);
            const avg = averageData[year].total / averageData[year].count;
            averagePercentages.push(avg);
        });

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

        let synth = new Tone.MembraneSynth({
            harmonicity: 3,  // Ajuste que controla la relación de frecuencia entre el portador y el modulador
            modulationIndex: 10,  // Controla la cantidad de modulación
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.1,
                release: 1.2
            },
            modulation: {
                type: "square"  // Onda cuadrada para un timbre más brillante
            }
        }).toDestination();
        
        let alertSynth = new Tone.Synth({  // Sonido adicional para el año 2015 (implementación del 4G)
            oscillator: {
                type: 'sine'  // Utilizamos un tono más limpio y claro
            },
            envelope: {
                attack: 0.5,  // Un ataque más largo para hacerlo más notorio
                decay: 0.5,
                sustain: 0.5,
                release: 2.0  // Un largo tiempo de liberación para mantener el sonido
            }
        }).toDestination();
        alertSynth.volume.value = -10;
        
        function mapPercentageToFrequency(percentage) {
            const minFrequency = 100;
            const maxFrequency = 1000;
            const minPercentage = 0;
            const maxPercentage = 100;
            return (percentage - minPercentage) * (maxFrequency - minFrequency) / (maxPercentage - minPercentage) + minFrequency;
        }
        
        // Función para animar y reproducir sonido en la línea de Chile
        function playChileSonification(countryData) {
            const chileData = countryData['CHL'];
            const years = chileData.years;
            const percentages = chileData.internet_users_percentage;
        
            let index = 21;
        
            // Agregar traza para el punto animado
            Plotly.addTraces('chart', {
                x: [], 
                y: [], 
                mode: 'markers',
                marker: { 
                    size: 15, 
                    color: '#FFFFFF',  // Color blanco para el relleno
                    line: {
                        color: '#000000',  // Color negro para el borde
                        width: 2  // Ancho del borde
                    }
                },
                name: 'Punto en movimiento',
                showlegend: false
            });
        
            function animatePoint() {
                if (index < 0) {
                    // Eliminar la traza del punto animado al terminar
                    Plotly.deleteTraces('chart', [traces.length - 1]);  
                    return;  // Terminar la animación cuando llegue al final
                }
        
                const year = years[index];
                const percentage = percentages[index];
                const frequency = mapPercentageToFrequency(percentage);
        
                // Verificar si es el año 2015 (implementación del 4G)
                if (year === "2014") {
                    // Reproducir un sonido largo y notorio cuando lleguemos al 4G
                    alertSynth.triggerAttackRelease('C5', '2n');  // Tono largo en C5
                } else {
                    // Reproducir sonido normal
                    synth.triggerAttackRelease(frequency, '8n');
                }
        
                // Actualizar el punto en la traza temporal sin modificar la línea original
                Plotly.update('chart', {
                    x: [[year]],  // Formato de array dentro de array
                    y: [[percentage]]  // Formato de array dentro de array
                }, {}, [traces.length - 1]);  // Apuntar a la nueva traza (última traza agregada)
        
                index = index - 1;
                setTimeout(animatePoint, 600);  // Ajustar la velocidad de la animación
            }
        
            // Iniciar la animación
            animatePoint();
        }
        
        

        document.addEventListener('DOMContentLoaded', function () {
            // Lista de países base
            const baseCountry = 'Chile';
            const otherCountries = ['Argentina', 'Brasil', 'Perú', 'Colombia'];
            const avgCategory = 'Promedio';
        
            // Contenedor de filtros dinámicos
            const filtersContainer = document.getElementById('filters');
        
            // Función para generar un enlace único
            function createCategoryLink(categoryName) {
                const baseUrl = window.location.origin + window.location.pathname;
                const link = `${baseUrl}?category=${encodeURIComponent(categoryName)}`;
                return link;
            }
        
            // Crear filtros dinámicos
            otherCountries.forEach((country) => {
                const categoryName = `${country}`;
                const link = createCategoryLink(categoryName);
        
                // Crear botón o enlace para cada filtro
                const filterElement = document.createElement('a');
                filterElement.href = link;
                filterElement.textContent = `Filtro: ${baseCountry}, ${country}, ${avgCategory}`;
                filterElement.className = 'filter-link'; // Agrega una clase para estilos
        
                // Agregar al contenedor
                filtersContainer.appendChild(filterElement);
            });
        
            // Evento para manejar clics en los filtros (opcional)
            filtersContainer.addEventListener('click', (event) => {
                if (event.target.tagName === 'A') {
                    event.preventDefault();
                    const category = new URL(event.target.href).searchParams.get('category');
                    console.log(`Cargando datos para la categoría: ${category}`);
                    loadChartData(category);
                }
            });
        
            // Función para cargar datos del gráfico según la categoría
            function loadChartData(category) {
                // Aquí se ajustaría la lógica para filtrar los datos y actualizar el gráfico.
                console.log(`Filtrando datos para: ${category}`);
                // Actualización de los gráficos según la categoría seleccionada
            }
        });
        

        // Asignar evento al botón
        document.getElementById('playSound').addEventListener('click', function() {
            playChileSonification(countryData);
        });

        const traces = [];
        const colors = {
            'CHL': '#FF0000',
            'ARG': '#1f77b4',
            'BRA': '#ff7f0e',
            'URY': '#2ca02c',
            'PER': '#d62728',
            'MEX': '#9467bd',
            'NIC': '#e377c2',
            'CUB': '#7f7f7f',
            'COL': '#bcbd22',
            'CRI': '#17becf',
            'DOM': '#8c564b',
            'ECU': '#e377c2',
            'GTM': '#7f7f7f',
            'HND': '#bcbd22',
            'PAN': '#17becf',
            'PRY': '#9467bd',
            'SLV': '#e377c2',
            'VEN': '#d62728'
        };



        selectedCountries.forEach(countryCode => {
            const trace = {
                x: countryData[countryCode].years,
                y: countryData[countryCode].internet_users_percentage,
                mode: 'lines+markers',
                name: countryData[countryCode].name,  // Asegurarse de que el 'name' contenga el nombre del país
                line: {
                    width: countryData[countryCode].name === 'Chile' ? 6 : 2,
                    color: colors[countryCode]
                },
                hovertemplate: 
                    '<b>%{fullData.name}</b><br>' +  // Usamos %{fullData.name} para asegurar que se muestre el nombre del país
                    'Año: %{x}<br>' +
                    'Usuarios de Internet: %{y}%<br>' +
                    'Suscripciones Totales: %{customdata}<extra></extra>',  // Suscripciones de Banda Ancha desde customdata
                customdata: data[countryCode].data.map(entry => entry.broadband_subscriptions),  // Mantenemos el customdata para las suscripciones
                hoverinfo: 'x+y+name+customdata',  // Asegura que la información aparezca en el hover
                visible: countryCode === 'CHL' ? true : false  // Solo Chile es visible al inicio
            };
            traces.push(trace);
        });
        
        
        
        
        

        const averageTrace = {
            x: averageYears,
            y: averagePercentages,
            mode: 'lines+markers',
            name: 'Promedio América Latina',
            line: {
                width: 5,
                color: '#000000',
                dash: 'dash'
            },
            hoverinfo: 'name+y',
            visible: true  // Mostrar el promedio siempre
        };
        traces.push(averageTrace);

        const layout = {
            width: 1650,
            height: 800,
            hovermode: 'closest',
            title: 'Porcentaje de Población con Acceso a Internet en América Latina (2000-2021)',
            xaxis: {
                title: 'Año',
                tickmode: 'linear',
                tick0: 2000,
                dtick: 1,
                range: [2000, 2021],  // Inicialmente muestra todo el período
                rangeslider: {
                    visible: true,
                    range: [2000, 2021],  // Rango completo para el slider
                    thickness: 0.15
                },
                fixedrange: false  // Permitir hacer zoom en el gráfico principal
            },
            yaxis: {
                title: 'Porcentaje de Usuarios de Internet',
                range: [0, 100],
                fixedrange: false  // Permitir hacer zoom en el gráfico principal
            },
            dragmode: 'zoom',  // Permitir zoom mediante selección
            legend: {
                x: 1,
                y: 1,
                title: {
                    text: 'Simbología'
                }
            },
            updatemenus: [{
                buttons: [
                    {
                        method: 'restyle',
                        args: [{'visible': [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]}],  // Solo Chile y Promedio visibles
                        label: 'Solo Chile',
                        execute: function() {
                            window.history.pushState(null, null, '/chile');
                        }
                    },
                    {
                        method: 'restyle',
                        args: [{'visible': [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, true]}],  // Cono Sur + promedio
                        label: 'Cono Sur',
                        execute: function() {
                            window.location.href = '/cono-sur';
                        }
                    },
                    {
                        method: 'restyle',
                        args: [{'visible': [true, true, true, true, true, false, false, false, true, false, false, true, false, false, false, true, false, true, true]}],  // Sudamérica + promedio
                        label: 'Sudamérica',
                        execute: function() {
                            window.history.pushState(null, null, '/sudamerica');
                        }
                    },
                    {
                        method: 'restyle',
                        args: [{'visible': [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]}],  // Toda América Latina + promedio
                        label: 'Latinoamérica',
                        execute: function() {
                            window.history.pushState(null, null, '/latinoamerica');
                        }
                    },
                    // Agregar los otros países (Argentina, Brasil, Colombia, Perú)
                    {
                        method: 'restyle',
                        args: [{'visible': [true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]}],
                        label: 'Argentina + Chile + Promedio',
                        execute: function() {
                            window.history.pushState(null, null, '/argentina');
                        }
                    },
                    {
                        method: 'restyle',
                        args: [{'visible': [true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]}],
                        label: 'Brasil + Chile + Promedio',
                        execute: function() {
                            window.history.pushState(null, null, '/brasil');
                        }
                    },
                    {
                        method: 'restyle',
                        args: [{'visible': [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]}],
                        label: 'Colombia + Chile + Promedio',
                        execute: function() {
                            window.history.pushState(null, null, '/colombia');
                        }
                    },
                    {
                        method: 'restyle',
                        args: [{'visible': [true, true, false, false, false, true]}],
                        label: 'Perú + Chile + Promedioaaaaaaaaa',
                        execute: function() {
                            window.history.pushState(null, null, '/peru');
                        }
                    }
                ],
                direction: 'down',
                showactive: true
            }],
            
            annotations: [
                {
                    x: 2003,
                    y: 25.3,
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
                    bgcolor: '#ffffff',
                    visible: true  // Asociar con Chile
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
                    bgcolor: '#ffffff',
                    visible: true  // Asociar con Chile
                    
                }
            ]
        };

        Plotly.newPlot('chart', traces, layout);
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
    });