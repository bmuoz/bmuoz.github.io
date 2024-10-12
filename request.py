import requests
import json

countries = ["ARG", "BRA", "CHL", "COL", "CRI", "CUB", "DOM", "ECU", "GTM", "HND", "MEX", "NIC", "PAN", "PER", "PRY", "SLV", "URY", "VEN"]

indicators = {
    "SP.POP.TOTL": "population",
    "IT.NET.USER.ZS": "internet_users_percentage",
    "IT.NET.BBND": "broadband_subscriptions",
}

base_url = "http://api.worldbank.org/v2/country/{}/indicator/{}?date=2000:2021&format=json"
data_dict = {}

for country in countries:
    country_data = {
        "country_name": "",
        "data": []
    }

    for indicator, indicator_name in indicators.items():
        url = base_url.format(country, indicator)
        response = requests.get(url)

        if response.status_code == 200:
            json_data = response.json()
            if json_data and len(json_data) > 1: 
                country_name = json_data[1][0]["country"]["value"]
                country_data["country_name"] = country_name

                for entry in json_data[1]:
                    year = entry["date"]
                    value = entry["value"]

                    existing_entry = next((item for item in country_data["data"] if item["year"] == year), None)
                    if existing_entry:
                        existing_entry[indicator_name] = value
                    else:
                        country_data["data"].append({"year": year, indicator_name: value})

    data_dict[country] = country_data

with open("data.json", "w") as json_file:
    json.dump(data_dict, json_file, indent=4)

print("done")
