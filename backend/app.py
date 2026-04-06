from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import keras
import math

# Patch Dense.from_config to ignore quantization_config (model saved with newer Keras)
_original_dense_from_config = keras.layers.Dense.from_config.__func__

@classmethod
def _patched_from_config(cls, config):
    config.pop("quantization_config", None)
    return _original_dense_from_config(cls, config)

keras.layers.Dense.from_config = _patched_from_config

app = Flask(__name__)
CORS(app)

women_model = keras.models.load_model("women_model.keras")
men_model = keras.models.load_model("men_model.keras")
other_model = keras.models.load_model("other_model.keras")

# Holiday mapping by quarter (deterministic)
QUARTER_HOLIDAYS = {
    1: ['has_new_year', 'has_valentines', 'has_presidents_day'],
    2: ['has_easter', 'has_mothers_day', 'has_memorial_day', 'has_fathers_day'],
    3: ['has_independence_day', 'has_labor_day'],
    4: ['has_halloween', 'has_thanksgiving', 'has_christmas'],
}

ALL_HOLIDAYS = [
    'has_christmas', 'has_thanksgiving', 'has_mothers_day',
    'has_fathers_day', 'has_valentines', 'has_easter', 'has_new_year',
    'has_halloween', 'has_independence_day', 'has_labor_day',
    'has_memorial_day', 'has_presidents_day',
]

# Features must match the order used in 67predict.py training
FEATURES = [
    'Year', 'Quarter', 'Quarter_sin', 'Quarter_cos',
    'GDP',
    'rainy_days', 'snowy_days', 'foggy_days',
] + ALL_HOLIDAYS


def format_input(year, quarter, gdp, weather):
    quarter_sin = math.sin(2 * math.pi * quarter / 4)
    quarter_cos = math.cos(2 * math.pi * quarter / 4)

    # Auto-compute holiday flags from quarter
    active_holidays = QUARTER_HOLIDAYS.get(quarter, [])
    holiday_flags = [1 if h in active_holidays else 0 for h in ALL_HOLIDAYS]

    row = [
        year, quarter, quarter_sin, quarter_cos,
        gdp,
        weather['rainy_days'], weather['snowy_days'], weather['foggy_days'],
    ] + holiday_flags

    return np.array([row])


@app.route('/api/walmart/predict', methods=['GET'])
def predict_sales():
    try:
        year = int(request.args.get("year"))
        quarter = int(request.args.get("quarter"))
        gdp = float(request.args.get("gdp"))

        weather = {
            'rainy_days': float(request.args.get("rainy_days", 20)),
            'snowy_days': float(request.args.get("snowy_days", 0)),
            'foggy_days': float(request.args.get("foggy_days", 5)),
        }

        X = format_input(year, quarter, gdp, weather)

        women_pred = women_model.predict(X)[0][0]
        men_pred = men_model.predict(X)[0][0]
        other_pred = other_model.predict(X)[0][0]

        return jsonify({
            "success": True,
            "WomenClothing": round(float(women_pred), 2),
            "MenClothing": round(float(men_pred), 2),
            "OtherClothing": round(float(other_pred), 2)
        })

    except Exception as e:
        return jsonify({"success": False, "details": str(e)}), 400


if __name__ == "__main__":
    sample_weather = {
        'rainy_days': 25, 'snowy_days': 8, 'foggy_days': 10,
    }
    print("Sample:",
          women_model.predict(format_input(2024, 1, 28708, sample_weather)))
    app.run(host="0.0.0.0", port=4000)
