from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import math

app = Flask(__name__)
CORS(app)

women_model = tf.keras.models.load_model("women_model.keras")
men_model = tf.keras.models.load_model("men_model.keras")
other_model = tf.keras.models.load_model("other_model.keras")

def format_input(year, month):
    month_sin = math.sin(2 * math.pi * month / 12)
    month_cos = math.cos(2 * math.pi * month / 12)
    return np.array([[year, month, month_sin, month_cos]])


@app.route('/api/walmart/predict', methods=['GET'])
def predict_sales():
    try:
        year = int(request.args.get("year"))
        month = int(request.args.get("month"))

        X = format_input(year, month)

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
    print("Sample:",
          women_model.predict(format_input(2024, 1)))
    app.run(host="0.0.0.0", port=3000)