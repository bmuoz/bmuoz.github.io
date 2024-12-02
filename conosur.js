fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const selectedCountries = ['CHL', 'ARG', 'BRA', 'URY', 'PER', 'MEX', 'NIC', 'CUB', 'COL', 'CRI', 'DOM', 'ECU', 'GTM', 'HND', 'PAN', 'PRY', 'SLV', 'VEN'];
        const allCountries = Object.keys(data);
        const years = [];
        const countryData = {};
        const averageData = {};

        const config = {
            responsive: true
        };

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
            harmonicity: 3,
            modulationIndex: 10, 
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.1,
                release: 1.2
            },
            modulation: {
                type: "square"
            }
        }).toDestination();
        
        let alertSynth = new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.5,
                decay: 0.5,
                sustain: 0.5,
                release: 2.0 
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
        
        function playChileSonification(countryData) {
            const chileData = countryData['CHL'];
            const years = chileData.years;
            const percentages = chileData.internet_users_percentage;
        
            let index = 21;
        
            Plotly.addTraces('chart', {
                x: [], 
                y: [], 
                mode: 'markers',
                marker: { 
                    size: 15, 
                    color: '#FFFFFF',
                    line: {
                        color: '#000000',
                        width: 2
                    }
                },
                name: 'Punto en movimiento',
                showlegend: false
            });
        
            function animatePoint() {
                if (index < 0) {
                    Plotly.deleteTraces('chart', [traces.length - 1]);  
                    return;
                }
        
                const year = years[index];
                const percentage = percentages[index];
                const frequency = mapPercentageToFrequency(percentage);
        
                if (year === "2014") {
                    alertSynth.triggerAttackRelease('C5', '2n');
                } else {
                    synth.triggerAttackRelease(frequency, '8n');
                }
        
                Plotly.update('chart', {
                    x: [[year]],
                    y: [[percentage]]
                }, {}, [traces.length - 1]);
        
                index = index - 1;
                setTimeout(animatePoint, 600);
            }
        
            animatePoint();
        }
        
    

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
                name: countryData[countryCode].name,
                line: {
                    width: countryData[countryCode].name === 'Chile' ? 6 : 2,
                    color: colors[countryCode]
                },
                hovertemplate: 
                    '<b>%{fullData.name}</b><br>' +  
                    'Año: %{x}<br>' +
                    'Usuarios de Internet: %{y}%<br>' +
                    'Suscripciones Totales: %{customdata}<extra></extra>', 
                customdata: data[countryCode].data.map(entry => entry.broadband_subscriptions),
                hoverinfo: 'x+y+name+customdata',
                visible: ['CHL', 'ARG', 'BRA', 'URY', 'PRY'].includes(countryCode) ? true : false
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
            visible: true
        };
        traces.push(averageTrace);

        const layout = {
            hovermode: 'closest',
            title: 'Porcentaje de Población con Acceso a Internet en América Latina (2000-2021)',
            xaxis: {
                title: 'Año',
                tickmode: 'linear',
                tick0: 2000,
                dtick: 1,
                range: [2000, 2021],
                fixedrange: false
            },
            yaxis: {
                title: 'Porcentaje de Usuarios de Internet',
                range: [0, 100],
                fixedrange: false
            },
            dragmode: 'zoom',
            legend: {
                x: 1,
                y: 1,
                title: {
                    text: 'Simbología'
                }
            },
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
                    visible: true
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
                    visible: true
                    
                }
            ]
        };

        Plotly.newPlot('chart', traces, layout, config);
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
    });