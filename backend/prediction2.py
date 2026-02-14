import pandas as pd
import numpy as np
import matplotlib.pyplot as plt 
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import TimeSeriesSplit
import warnings
warnings.filterwarnings('ignore')

def create_specific_holiday_flags(original_holidays):

    retail_holidays = {
        'has_christmas': 'Christmas',  
        'has_thanksgiving': 'Thanksgiving Day',
        'has_mothers_day': "Mother's Day",
        'has_fathers_day': "Father's Day",
        'has_valentines': "Valentine's Day",
        'has_easter': "Easter Sunday",
        'has_new_year': 'New Year', 
    }
    
    all_holiday_flags = None
    
    for flag_name, search_term in retail_holidays.items():
        if 'Day' in search_term or 'Sunday' in search_term:
            months_with_holiday = original_holidays[
                original_holidays['Event'] == search_term
            ][['Year', 'Month']].drop_duplicates()
        else:
            months_with_holiday = original_holidays[
                original_holidays['Event'].str.contains(search_term, case=False)
            ][['Year', 'Month']].drop_duplicates()
        
        months_with_holiday[flag_name] = 1
        
        if all_holiday_flags is None:
            all_holiday_flags = months_with_holiday
        else:
            all_holiday_flags = all_holiday_flags.merge(
                months_with_holiday, 
                on=['Year', 'Month'], 
                how='outer'
            )
    
    all_holiday_flags = all_holiday_flags.fillna(0)
    
    return all_holiday_flags


def preprocess_data():
    le = LabelEncoder()

    YEARS_TO_REMOVE = [2015, 2016]
    MONTHS_MAPPING = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
        "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
    }
    CLOTHING_CATEGORIES = ["WomenClothing", "MenClothing", "OtherClothing"]
    HOLIDAY_COLUMNS = [
        "has_christmas", "has_thanksgiving", "has_mothers_day",
        "has_fathers_day", "has_valentines", "has_easter", "has_new_year",
    ]
    LAG_PERIODS = [12, 24]

    all_sheets = pd.read_excel("backend/walmart-sales-prediction-hyd-nov-2023/WeatherData.xlsx", sheet_name=None)
    frames = []
    for sheet_name, df in all_sheets.items():
        df["Year"] = int(sheet_name)
        frames.append(df)
    weather_df = pd.concat(frames, ignore_index=True)
    weather_df.columns = weather_df.columns.str.strip()
    weather_df.columns = weather_df.columns.str.replace('\xa0', ' ')
    print(weather_df.columns.tolist())
    weather_df.to_csv("weather_df.csv")
    macro_df = pd.read_excel("backend/walmart-sales-prediction-hyd-nov-2023/macro_economic.xlsx")
    holiday_df = pd.read_excel("backend/walmart-random/Events_holidaysData.xlsx", dtype={"MonthDate": str})
    clothing_data = pd.read_csv("backend/train.csv")

    weather_df = weather_df[~weather_df["Year"].isin(YEARS_TO_REMOVE)]
    weather_df['has_snow'] = weather_df['WeatherEvent'].str.contains('Snow', na=False).astype(int)
    weather_df['has_rain'] = weather_df['WeatherEvent'].str.contains('Rain', na=False).astype(int)

    weather_df['Month'] = weather_df['Month'].str.strip().str[:3]  
    weather_df['Month'] = weather_df['Month'].map(MONTHS_MAPPING)  

    numeric_cols = [
    'Temp high (°C)', 'Temp avg (°C)', 'Temp low (°C)',
    'Humidity (%) avg', 'Precip. (mm) sum','Visibility (km) avg','Wind (km/h) avg'
    ]
    for col in numeric_cols:
        weather_df[col] = weather_df[col].replace('T', 0.01)
        weather_df[col] = pd.to_numeric(weather_df[col], errors='coerce')

    weather_monthly = weather_df.groupby(['Year', 'Month']).agg(
        temp_avg=('Temp avg (°C)', 'mean'),
        temp_high_max=('Temp high (°C)', 'max'),
        temp_low_min=('Temp low (°C)', 'min'),
        precip_total=('Precip. (mm) sum', 'sum'),
        humidity_avg=('Humidity (%) avg', 'mean'),
        snow_days=('has_snow', 'sum'),
        rain_days=('has_rain', 'sum'),
        visibility=('Visibility (km) avg', 'mean'),
        wind=('Wind (km/h) avg', 'mean'),
    ).reset_index()

    weather_monthly.to_csv("weathermonthly.csv")


    holiday_df.insert(loc=2, column="Day", value=holiday_df["MonthDate"].str[2:4].astype(int))
    holiday_df.insert(loc=1, column="Month", value=holiday_df["MonthDate"].str[5:7].astype(int))
    holiday_df = (
        holiday_df
        .drop(columns="MonthDate")
        .query("Year not in @YEARS_TO_REMOVE")
        .sort_values(["Year", "Month"])
    )

    holiday_flags = create_specific_holiday_flags(holiday_df)
    holiday_flags.to_csv("holiday_df.csv", index=False, encoding="utf-8")

    years, months = [], []
    for item in macro_df["Year-Month"]:
        year_str, month_str = item.split("-")
        years.append(int(year_str.strip()))
        months.append(MONTHS_MAPPING[month_str.strip()])

    macro_df.insert(loc=0, column="Year", value=years)
    macro_df.insert(loc=1, column="Month", value=months)
    macro_df = (
        macro_df
        .drop(columns="Year-Month")
        .query("Year not in @YEARS_TO_REMOVE")
    )

    pivoted_data = clothing_data.pivot(
        index=["Year", "Month"],
        columns="ProductCategory",
        values="Sales(In ThousandDollars)",
    )

    training = pivoted_data.copy()
    for col in CLOTHING_CATEGORIES:
        training[col] = training[col].interpolate(method="linear")

    macro_df = pd.merge(macro_df, training, on=["Year", "Month"], how="left")

    macro_df["PartyInPower"] = le.fit_transform(macro_df["PartyInPower"])

    merged_df = macro_df.merge(holiday_flags, on=["Year", "Month"], how="left")
    # merged_df = merged_df.drop(columns="AdvertisingExpenses (in Thousand Dollars)")
    merged_df[HOLIDAY_COLUMNS] = merged_df[HOLIDAY_COLUMNS].fillna(0)

    merged_df["is_q4"] = (merged_df["Month"] >= 10).astype(int)
    merged_df["is_holiday_season"] = merged_df["Month"].isin([11, 12]).astype(int)
    merged_df["is_back_to_school"] = merged_df["Month"].isin([8, 9]).astype(int)
    merged_df["is_spring_shopping"] = merged_df["Month"].isin([3, 4, 5]).astype(int)
    merged_df["is_summer"] = merged_df["Month"].isin([6, 7, 8]).astype(int)
    merged_df["is_winter"] = merged_df["Month"].isin([12, 1, 2]).astype(int)

    for cat in CLOTHING_CATEGORIES:
        for lag in LAG_PERIODS:
            merged_df[f"{cat}_lag{lag}"] = merged_df[cat].shift(lag)

    merged_df = merged_df.merge(weather_monthly, on=['Year', 'Month'], how='left')

    merged_df["Month_sin"] = np.sin(2 * np.pi * merged_df["Month"] / 12)
    merged_df["Month_cos"] = np.cos(2 * np.pi * merged_df["Month"] / 12)

    merged_df["total_clothing"] = merged_df[CLOTHING_CATEGORIES].sum(axis=1)
    merged_df["women_share"] = merged_df["WomenClothing"] / (merged_df["total_clothing"] + 1e-8)
    merged_df["other_share"] = merged_df["OtherClothing"] / (merged_df["total_clothing"] + 1e-8)
    merged_df["men_share"] = merged_df["MenClothing"] / (merged_df["total_clothing"] + 1e-8)

    merged_df["GDP-ROC"] = merged_df["Monthly Real GDP Index (inMillion$)"].pct_change()
    merged_df["CPI-ROC"] = merged_df["CPI"].pct_change()
    merged_df["Unemployment-Change"] = merged_df["unemployment rate"].diff()

    train_df = merged_df[merged_df["WomenClothing"].notna()].copy()
    test_df = merged_df[merged_df["WomenClothing"].isna()].copy()

    # train_corr = train_df.corr()

    # target_features = ['MenClothing', 'OtherClothing', 'WomenClothing']
    # filtered_corr = train_corr.loc[target_features]

    # plt.figure(figsize=(20, 10))
    # sns.heatmap(filtered_corr, annot=False, linewidths=0.5)

    # plt.show()

    train_df.to_csv("trainin.csv", index=True, encoding="utf-8")
    test_df.to_csv("testin.csv", index=True, encoding="utf-8")

    return train_df, test_df

# =============================================================================
# STEP 2: FEATURE SELECTION PER CATEGORY
# =============================================================================
def get_features_for_category(category, all_columns):
    """Build the feature list for a given target category."""

    shared = [
    'Month_sin', 'Month_cos', 'Year',
    'Monthly Real GDP Index (inMillion$)', 'CPI',
    'unemployment rate',
    'has_christmas', 'has_thanksgiving', 'has_mothers_day',
    'has_fathers_day', 'has_valentines', 'has_easter', 'has_new_year',
    'is_q4', 'is_holiday_season', 'is_back_to_school',
    'is_spring_shopping', 'is_summer', 'is_winter',
    'GDP-ROC', 'CPI-ROC', 'Unemployment-Change',
    'temp_avg', 'temp_high_max', 'temp_low_min', 'temp_range',
    'precip_total', 'humidity_avg',
    'visibility', 'wind',"Cotton Monthly Price - US cents per Pound(lbs)",
        "Average upland harvested(million acres)",
        "Production (in  480-lb netweright in million bales)",
        "Average upland planted(million acres)",
        "Earnings or wages  in dollars per hour",
        "Finance Rate on Personal Loans at Commercial Banks, 24 Month Loan",
        "CommercialBankInterestRateonCreditCardPlans",
        "Exports",
        "Change(in%)",
]
    cat_lags = [f'{category}_lag{lag}' for lag in [12, 24]]

    all_features = shared + cat_lags
    return [f for f in all_features if f in all_columns]


# =============================================================================
# STEP 3: ENSEMBLE (sklearn only — no OpenMP needed)
# =============================================================================
def train_ensemble(X_train, y_train, X_val, y_val, feature_names=None):
    """Train Ridge + GradientBoosting + RandomForest ensemble."""
    models = {}
    val_scores = {}

    # Ridge
    ridge = Ridge(alpha=6)
    ridge.fit(X_train, y_train)
    ridge_mae = mean_absolute_error(y_val, ridge.predict(X_val))
    models['Ridge'] = ridge
    val_scores['Ridge'] = ridge_mae
    print(f"    Ridge  — Val MAE: {ridge_mae:.2f}")

    # Sklearn GradientBoosting
    gb = GradientBoostingRegressor(
        n_estimators=300, max_depth=2, learning_rate=0.01,
        subsample=0.8, min_samples_leaf=3, random_state=42
    )
    gb.fit(X_train, y_train)
    if feature_names is not None:
        importances = pd.Series(gb.feature_importances_, index=feature_names)
        importances = importances.sort_values(ascending=False)
        print(importances)

    importances.head(15).plot(kind='barh', figsize=(10, 6))
    plt.title('Top 15 Feature Importances (GBR)')
    plt.xlabel('Importance')
    plt.tight_layout()
    plt.show()
    gb_mae = mean_absolute_error(y_val, gb.predict(X_val))
    models['GradientBoosting'] = gb
    val_scores['GradientBoosting'] = gb_mae
    print(f"    GBR    — Val MAE: {gb_mae:.2f}")

    # Random Forest
    rf = RandomForestRegressor(
        n_estimators=300, max_depth=3, min_samples_leaf=3, random_state=42
    )
    rf.fit(X_train, y_train)
    rf_mae = mean_absolute_error(y_val, rf.predict(X_val))
    models['RandomForest'] = rf
    val_scores['RandomForest'] = rf_mae
    print(f"    RF     — Val MAE: {rf_mae:.2f}")

    return models, val_scores


def ensemble_predict(models, val_scores, X):
    """Weighted average prediction — inverse MAE weighting."""
    if not models:
        return np.zeros(len(X))

    inv_scores = {k: 1.0 / (v + 1e-8) for k, v in val_scores.items()}
    total = sum(inv_scores.values())
    weights = {k: v / total for k, v in inv_scores.items()}

    preds = np.zeros(len(X))
    for name, model in models.items():
        preds += weights[name] * model.predict(X)

    return preds


# =============================================================================
# STEP 4: CROSS-VALIDATION + FORECASTING
# =============================================================================
def run_pipeline():
    print("=" * 60)
    print("  PREPROCESSING")
    print("=" * 60)
    train_df, test_df = preprocess_data()

    TARGET_COLS = ['WomenClothing', 'MenClothing', 'OtherClothing']
    all_predictions = []

    for category in TARGET_COLS:
        print(f"\n{'='*60}")
        print(f"  {category}")
        print(f"{'='*60}")

        features = get_features_for_category(category, train_df.columns)
        print(f"  Using {len(features)} features")

        # Prepare data
        cols_needed = features + [category]
        df = train_df[cols_needed].dropna().copy()
        print(f"  Usable rows: {len(df)}")

        X = df[features].values
        y = df[category].values

        # ── Time-series cross-validation ──
        tscv = TimeSeriesSplit(n_splits=3)
        cv_scores = []

        print(f"\n  Cross-validation (3-fold temporal):")
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            X_tr, X_va = X[train_idx], X[val_idx]
            y_tr, y_va = y[train_idx], y[val_idx]

            models_fold, scores_fold = train_ensemble(X_tr, y_tr, X_va, y_va, features)
            ens_pred = ensemble_predict(models_fold, scores_fold, X_va)
            fold_mae = mean_absolute_error(y_va, ens_pred)
            cv_scores.append(fold_mae)
            print(f"    Fold {fold+1} Ensemble MAE: {fold_mae:.2f}")

        print(f"  Mean CV MAE: {np.mean(cv_scores):.2f} +/- {np.std(cv_scores):.2f}")

        # ── Train final models — last 20% as pseudo-val for weighting ──
        print(f"\n  Training final models on all {len(X)} rows...")
        split = int(len(X) * 0.8)
        final_models, final_scores = train_ensemble(
            X[:split], y[:split], X[split:], y[split:], features
        )

        # ── Retrain on full data for predictions ──
        full_models = {}
        for name, model in final_models.items():
            clone = model.__class__(**model.get_params())
            clone.fit(X, y)
            full_models[name] = clone

        # ── Recursive 12-month forecast ──
        forecast_rows = test_df.copy() if len(test_df) >= 12 else None
        category_preds = []

        if forecast_rows is not None and len(forecast_rows) >= 12:
            for i in range(min(12, len(forecast_rows))):
                row = forecast_rows.iloc[i:i+1]
                available_features = [f for f in features if f in row.columns]

                X_pred = row[available_features].copy()

                # Fill NaN lag/rolling features with predictions so far
                for col in X_pred.columns:
                    if X_pred[col].isna().any():
                        if 'lag1' in col and len(category_preds) >= 1:
                            X_pred[col] = category_preds[-1]
                        elif 'lag2' in col and len(category_preds) >= 2:
                            X_pred[col] = category_preds[-2]
                        elif 'lag3' in col and len(category_preds) >= 3:
                            X_pred[col] = category_preds[-3]
                        elif 'lag6' in col and len(category_preds) >= 6:
                            X_pred[col] = category_preds[-6]
                        elif 'lag12' in col:
                            X_pred[col] = train_df[col].dropna().iloc[-1] if col in train_df.columns else 0
                        else:
                            X_pred[col] = train_df[col].dropna().iloc[-1] if col in train_df.columns else 0

                # Build final feature array in correct order
                X_final = np.zeros((1, len(features)))
                for j, f in enumerate(features):
                    if f in available_features:
                        val = X_pred[f].values[0]
                        X_final[0, j] = val if not np.isnan(val) else 0
                    elif f in train_df.columns:
                        last_val = train_df[f].dropna()
                        X_final[0, j] = last_val.iloc[-1] if len(last_val) > 0 else 0

                pred = ensemble_predict(full_models, final_scores, X_final)[0]
                pred = max(pred, 0)
                category_preds.append(round(pred, 2))
        else:
            # Fallback: repeat last known features
            print("  WARNING: No test_df rows, using last-row extrapolation")
            last_X = X[-1:].copy()
            for step in range(12):
                pred = ensemble_predict(full_models, final_scores, last_X)[0]
                pred = max(pred, 0)
                category_preds.append(round(pred, 2))

        all_predictions.extend(category_preds)
        print(f"\n  12-month forecast: {category_preds}")

    # ── Save submission ──
    submission = pd.DataFrame({
        'Year': range(1, 37),
        'Sales(In ThousandDollars)': all_predictions
    })
    submission.to_csv("submissions.csv", index=False)
    print(f"\n{'='*60}")
    print("SUBMISSION SAVED — submissions.csv")
    print(f"{'='*60}")
    print(submission.to_string(index=False))

    return submission


if __name__ == "__main__":
    submission = run_pipeline()