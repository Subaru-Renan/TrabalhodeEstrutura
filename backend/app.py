from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import traceback

app = Flask(__name__)
CORS(app)

COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,population,area,flags,cca2,region"

@app.route("/api/countries")
def get_countries():
    try:
        print("Buscando países da API externa...")
        resp = requests.get(COUNTRIES_API, timeout=15)
        print(f"Status da API: {resp.status_code}")
        data = resp.json()
        print(f"Total recebido: {len(data)} países")

        countries = []
        for c in data:
            try:
                pop = c.get("population", 0) or 0
                area = c.get("area", 0) or 0
                name_obj = c.get("name", {})
                name = name_obj.get("common", "") if isinstance(name_obj, dict) else str(name_obj)
                flags = c.get("flags", {}) or {}
                countries.append({
                    "name": name,
                    "population": pop,
                    "area": round(float(area), 2) if area else 0,
                    "density": round(pop / float(area), 2) if area and float(area) > 0 else 0,
                    "flag": flags.get("png", "") if isinstance(flags, dict) else "",
                    "flagSvg": flags.get("svg", "") if isinstance(flags, dict) else "",
                    "code": c.get("cca2", ""),
                    "region": c.get("region", ""),
                })
            except Exception as inner:
                print(f"Erro ao processar país: {inner} | dados: {c}")
                continue

        countries.sort(key=lambda x: x["name"])
        print(f"Retornando {len(countries)} países.")
        return jsonify(countries)

    except Exception as e:
        print("ERRO:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/search/linear", methods=["POST"])
def linear_search():
    body = request.json
    countries = body.get("countries", [])
    query = body.get("query", "").lower()
    key = body.get("key", "name")

    steps = []
    found_index = -1
    for i, country in enumerate(countries):
        value = str(country.get(key, "")).lower()
        match = query in value
        steps.append({
            "index": i,
            "current": i,
            "comparisons": i + 1,
            "found": match,
            "country": country,
        })
        if match:
            found_index = i
            break

    return jsonify({
        "steps": steps,
        "found": found_index,
        "totalComparisons": len(steps),
    })


@app.route("/api/search/binary", methods=["POST"])
def binary_search():
    body = request.json
    countries = body.get("countries", [])
    query = body.get("query", "").lower()
    key = body.get("key", "name")

    # Binary search works on sorted numeric or exact name match
    steps = []
    low, high = 0, len(countries) - 1
    found_index = -1
    comparisons = 0

    while low <= high:
        mid = (low + high) // 2
        value = str(countries[mid].get(key, "")).lower()
        comparisons += 1

        step = {
            "low": low,
            "mid": mid,
            "high": high,
            "comparisons": comparisons,
            "current": mid,
            "country": countries[mid],
            "discarded_left": list(range(0, low)),
            "discarded_right": list(range(high + 1, len(countries))),
        }

        if value == query:
            step["found"] = True
            steps.append(step)
            found_index = mid
            break
        elif value < query:
            step["found"] = False
            step["direction"] = "right"
            steps.append(step)
            low = mid + 1
        else:
            step["found"] = False
            step["direction"] = "left"
            steps.append(step)
            high = mid - 1

    return jsonify({
        "steps": steps,
        "found": found_index,
        "totalComparisons": comparisons,
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
