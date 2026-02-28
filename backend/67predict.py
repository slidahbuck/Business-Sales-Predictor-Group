
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

    df.sort_values(['Year','Month'], inplace=True)
    df.reset_index(drop=True, inplace=True)

    df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)


features = ['Year','Month','Month_sin','Month_cos']


model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(67, activation='relu', input_shape=[4]),
    tf.keras.layers.Dense(69, activation='relu'),
    tf.keras.layers.Dense(67, activation='relu'),
    tf.keras.layers.Dense(1)
])

lr = 0.001

model.compile(
    loss='mse',
    optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
    metrics=['mae']
)


X = women_train[features]
y = women_train['WomenClothing']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

history = model.fit(X_train, y_train, epochs=20000)

pred_women = model.predict(women_test[features]).ravel()

error = y_test.values - model.predict(X_test).ravel()
print("Women:", np.abs(error).mean())


X = men_train[features]
y = men_train['MenClothing']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

history = model.fit(X_train, y_train, epochs=20000)

pred_men = model.predict(men_test[features]).ravel()

error = y_test.values - model.predict(X_test).ravel()
print("Men:", np.abs(error).mean())

X = other_train[features]
y = other_train['OtherClothing']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

history = model.fit(X_train, y_train, epochs=20000)

pred_other = model.predict(other_test[features]).ravel()

error = y_test.values - model.predict(X_test).ravel()
print("Other:", np.abs(error).mean())


all_predictions = []

for i in range(12):
    all_predictions.append(pred_women[i])
    all_predictions.append(pred_men[i])
    all_predictions.append(pred_other[i])

submission = pd.DataFrame({
    'Year': range(1, len(all_predictions)+1),
    'Sales': all_predictions
})

submission.to_csv("submission.csv", index=False)


print(submission)