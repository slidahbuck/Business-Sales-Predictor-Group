import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import TimeSeriesSplit
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_file(relative_path):
    return os.path.join(BASE_DIR, relative_path)


def create_specific_holiday_flags(original_holidays):

    retail_holidays = {
        'has_christmas': 'Christmas',
        'has_thanksgiving': 'Thanksgiving Day',
        'has_mothers_day': "Mother's Day",
        'has_fathers_day': "Father's Day",
        'has_valentines': "Valentine's Day",
        'has_easter': "Easter Sunday",
        'has_new_year': 'New Year'
    }

    all_holiday_flags = None

    for flag_name, search_term in retail_holidays.items():

        if 'Day' in search_term or 'Sunday' in search_term:
            months = original_holidays[
                original_holidays['Event'] == search_term
            ][['Year', 'Month']].drop_duplicates()
        else:
            months = original_holidays[
                original_holidays['Event'].str.contains(search_term, case=False)
            ][['Year', 'Month']].drop_duplicates()

        months[flag_name] = 1

        if all_holiday_flags is None:
            all_holiday_flags = months
        else:
            all_holiday_flags = all_holiday_flags.merge(
                months, on=['Year', 'Month'], how='outer'
            )

    return all_holiday_flags.fillna(0)

def preprocess_data():

    le = LabelEncoder()

    YEARS_TO_REMOVE = [2015, 2016]
    MONTHS_MAPPING = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
        "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
    }

    CLOTHING_CATEGORIES = ["WomenClothing", "MenClothing", "OtherClothing"]
    LAG_PERIODS = [1, 2, 3, 6, 12, 24]

    macro_df = pd.read_excel(load_file("walmart-sales-prediction-hyd-nov-2023/macro_economic.xlsx"))
    holiday_df = pd.read_excel(load_file("walmart-random/Events_holidaysData.xlsx"), dtype={"MonthDate": str})
    clothing_data = pd.read_csv(load_file("train.csv"))

    holiday_df.insert(2, "Day", holiday_df["MonthDate"].str[2:4].astype(int))
    holiday_df.insert(1, "Month", holiday_df["MonthDate"].str[5:7].astype(int))
    holiday_df = holiday_df.drop(columns="MonthDate")
    holiday_df = holiday_df.query("Year not in @YEARS_TO_REMOVE")

    holiday_flags = create_specific_holiday_flags(holiday_df)

    years, months = [], []
    for item in macro_df["Year-Month"]:
        y, m = item.split("-")
        years.append(int(y.strip()))
        months.append(MONTHS_MAPPING[m.strip()])

    macro_df.insert(0, "Year", years)
    macro_df.insert(1, "Month", months)
    macro_df = macro_df.drop(columns="Year-Month")
    macro_df = macro_df.query("Year not in @YEARS_TO_REMOVE")

    pivoted = clothing_data.pivot(
        index=["Year", "Month"],
        columns="ProductCategory",
        values="Sales(In ThousandDollars)"
    )

    training = pivoted.copy()
    for col in CLOTHING_CATEGORIES:
        training[col] = training[col].interpolate()

    macro_df = pd.merge(macro_df, training, on=["Year", "Month"], how="left")

    macro_df["PartyInPower"] = le.fit_transform(macro_df["PartyInPower"])

    merged_df = macro_df.merge(holiday_flags, on=["Year", "Month"], how="left")
    merged_df = merged_df.fillna(0)

    merged_df["is_q4"] = (merged_df["Month"] >= 10).astype(int)
    merged_df["is_holiday_season"] = merged_df["Month"].isin([11, 12]).astype(int)

    merged_df["Month_sin"] = np.sin(2 * np.pi * merged_df["Month"] / 12)
    merged_df["Month"] = np.cos(2 * np.pi * merged_df["Month"] / 12)

    merged_df["holiday_x_december"] = merged_df["has_christmas"] * merged_df["is_holiday_season"]

    for cat in CLOTHING_CATEGORIES:
        for lag in LAG_PERIODS:
            merged_df[f"{cat}_lag{lag}"] = merged_df[cat].shift(lag)

    merged_df["GDP-ROC"] = merged_df["Monthly Real GDP Index (inMillion$)"].pct_change()
    merged_df["CPI-ROC"] = merged_df["CPI"].pct_change()
    merged_df["Unemployment-Change"] = merged_df["unemployment rate"].diff()

    train_df = merged_df[merged_df["WomenClothing"] != 0].copy()
    test_df = merged_df[merged_df["WomenClothing"] == 0].copy()

    return train_df, test_df


def train_ensemble(X_train, y_train, X_val, y_val):

    models = {}
    scores = {}

    ridge = Ridge(alpha=100)
    ridge.fit(X_train, y_train)
    scores['Ridge'] = mean_absolute_error(y_val, ridge.predict(X_val))
    models['Ridge'] = ridge

    gb = GradientBoostingRegressor(n_estimators=300, random_state=42)
    gb.fit(X_train, y_train)
    scores['GB'] = mean_absolute_error(y_val, gb.predict(X_val))
    models['GB'] = gb

    rf = RandomForestRegressor(n_estimators=300, random_state=42)
    rf.fit(X_train, y_train)
    scores['RF'] = mean_absolute_error(y_val, rf.predict(X_val))
    models['RF'] = rf

    return models, scores


def ensemble_predict(models, scores, X):

    inv = {k: 1/(v+1e-8) for k, v in scores.items()}
    total = sum(inv.values())
    weights = {k: v/total for k, v in inv.items()}

    preds = np.zeros(len(X))
    for name, model in models.items():
        preds += weights[name] * model.predict(X)

    return preds


def run_pipeline():

    train_df, test_df = preprocess_data()

    TARGETS = ["WomenClothing", "MenClothing", "OtherClothing"]
    all_predictions = []

    for target in TARGETS:

        features = [col for col in train_df.columns if col != target]
        df = train_df.dropna().copy()

        X = df[features].values
        y = df[target].values

        split = int(len(X) * 0.8)

        models, scores = train_ensemble(
            X[:split], y[:split],
            X[split:], y[split:]
        )

        final_preds = ensemble_predict(models, scores, X[-12:])
        final_preds = [max(0, round(p, 2)) for p in final_preds]

        all_predictions.extend(final_preds)

    submission = pd.DataFrame({
        "Year": range(1, len(all_predictions)+1),
        "Sales(In ThousandDollars)": all_predictions
    })

    submission.to_csv("submissions.csv", index=False)

    print("\nSUBMISSION SAVED — submissions.csv")
    print(submission.head())

    return submission


if __name__ == "__main__":
    run_pipeline()
