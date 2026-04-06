
import pandas as pd
import numpy as np
import math
from sklearn.model_selection import train_test_split
import tensorflow as tf

print("TensorFlow version:", tf.__version__)


women_train = pd.read_csv("women_train.csv")
men_train = pd.read_csv("men_train.csv")
other_train = pd.read_csv("other_train.csv")

women_test = pd.read_csv("women_test.csv")
men_test = pd.read_csv("men_test.csv")
other_test = pd.read_csv("other_test.csv")


for df in [women_train, men_train, other_train, women_test, men_test, other_test]:

    df.sort_values(['Year','Quarter'], inplace=True)
    df.reset_index(drop=True, inplace=True)

    df['Quarter_sin'] = np.sin(2 * np.pi * df['Quarter'] / 4)
    df['Quarter_cos'] = np.cos(2 * np.pi * df['Quarter'] / 4)


features = [
    'Year', 'Quarter', 'Quarter_sin', 'Quarter_cos',
    'GDP',
    'rainy_days', 'snowy_days', 'foggy_days',
    'has_christmas', 'has_thanksgiving', 'has_mothers_day',
    'has_fathers_day', 'has_valentines', 'has_easter', 'has_new_year',
    'has_halloween', 'has_independence_day', 'has_labor_day',
    'has_memorial_day', 'has_presidents_day',
]

num_features = len(features)
print(f"Training with {num_features} features: {features}")


def build_model():
    model = tf.keras.models.Sequential([
        tf.keras.layers.Dense(67, activation='relu', input_shape=[num_features]),
        tf.keras.layers.Dense(140, activation='relu'),
        tf.keras.layers.Dense(67, activation='relu'),
        tf.keras.layers.Dense(1)
    ])
    model.compile(
        loss='mse',
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0067),
        metrics=['mae']
    )
    return model


def train_category(train_df, test_df, target_col, model_name):
    # Drop rows with NaN in features or target
    clean = train_df[features + [target_col]].dropna()
    X = clean[features].values
    y = clean[target_col].values

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = build_model()
    model.fit(X_train, y_train, epochs=1000, verbose=0)

    error = y_val - model.predict(X_val).ravel()
    print(f"{target_col}: MAE = {np.abs(error).mean():.2f}")

    # Retrain on full data
    final_model = build_model()
    final_model.fit(X, y, epochs=1000, verbose=0)
    final_model.save(f"{model_name}.keras")
    print(f"Saved {model_name}.keras")

<<<<<<< HEAD
model.save("women_model.keras")

model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(67, activation='relu', input_shape=[4]),
    tf.keras.layers.Dense(140, activation='relu'),
    tf.keras.layers.Dense(67, activation='relu'),
    tf.keras.layers.Dense(1)
])

model.compile(
    loss='mse',
    optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
    metrics=['mae']
)

X = men_train[features]
y = men_train['MenClothing']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

history = model.fit(X_train, y_train, epochs=1000)

pred_men = model.predict(men_test[features]).ravel()

error = y_test.values - model.predict(X_test).ravel()
print("Men:", np.abs(error).mean())

model.save("men_model.keras")

model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(67, activation='relu', input_shape=[4]),
    tf.keras.layers.Dense(140, activation='relu'),
    tf.keras.layers.Dense(67, activation='relu'),
    tf.keras.layers.Dense(1)
])

model.compile(
    loss='mse',
    optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
    metrics=['mae']
)

X = other_train[features]
y = other_train['OtherClothing']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

history = model.fit(X_train, y_train, epochs=1000)

pred_other = model.predict(other_test[features]).ravel()

error = y_test.values - model.predict(X_test).ravel()
print("Other:", np.abs(error).mean())

model.save("other_model.keras")
=======
    # Predict on test set
    test_clean = test_df[features].fillna(0)
    preds = final_model.predict(test_clean.values).ravel()
    return preds


pred_women = train_category(women_train, women_test, 'WomenClothing', 'women_model')
pred_men = train_category(men_train, men_test, 'MenClothing', 'men_model')
pred_other = train_category(other_train, other_test, 'OtherClothing', 'other_model')

>>>>>>> 31d4af2 (predictions with new gdp)
all_predictions = []
n_quarters = min(4, len(pred_women), len(pred_men), len(pred_other))

for i in range(n_quarters):
    all_predictions.append(pred_women[i])
    all_predictions.append(pred_men[i])
    all_predictions.append(pred_other[i])

submission = pd.DataFrame({
    'Quarter': range(1, len(all_predictions)+1),
    'Sales': all_predictions
})

submission.to_csv("submission.csv", index=False)

print(submission)
