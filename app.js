// Datos de estadísticas de goles y asistencias por temporada
var temporadas = ['2021/22', '2022/23', '2023/24'];
var goles = [5, 7, 10];
var asistencias = [3, 5, 6];

// Crear gráfico de barras para visualizar las estadísticas
var trace1 = {
    x: temporadas,
    y: goles,
    name: 'Goles',
    type: 'bar',
    marker: {color: 'blue'}
};

var trace2 = {
    x: temporadas,
    y: asistencias,
    name: 'Asistencias',
    type: 'bar',
    marker: {color: 'green'}
};

// Combinar los datos
var data = [trace1, trace2];

// Configurar el layout del gráfico
var layout = {
    title: 'Estadísticas por Temporada (Goles y Asistencias)',
    barmode: 'group',
    xaxis: { title: 'Temporada' },
    yaxis: { title: 'Cantidad' }
};

// Renderizar el gráfico en el div con id "grafico-estadisticas"
Plotly.newPlot('grafico-estadisticas', data, layout);
