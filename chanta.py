import json
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np

# Cargar los datos desde el archivo JSON
with open("data.json", "r") as json_file:
    data_dict = json.load(json_file)

# Configurar el tamaño del gráfico
plt.figure(figsize=(12, 8))

# Obtener una lista de colores desde una paleta de colores
num_countries = len(data_dict)
colors = cm.tab20.colors  # Usar los colores de la paleta 'tab20'

# Graficar cada país con un color diferente
for i, (country_code, country_info) in enumerate(data_dict.items()):
    country_name = country_info['country_name']
    data = country_info['data']
    years = [entry['year'] for entry in data]
    values = [entry['internet_users_percentage'] for entry in data]
    
    # Asignar un color único a cada línea
    plt.plot(years, values, marker='o', color=colors[i % len(colors)], label=country_name)

# Configuración de etiquetas y títulos
plt.title("Porcentaje de Usuarios de Internet en Países de América Latina (2000-2021)")
plt.xlabel("Año")
plt.ylabel("Porcentaje de usuarios de internet (%)")
plt.grid(True)

# Ajustar la leyenda para que no se superponga al gráfico
plt.legend(loc='upper left', bbox_to_anchor=(1, 1), ncol=1)

# Ajustar el layout para que los elementos no se corten
plt.tight_layout()

# Mostrar el gráfico
plt.show()


