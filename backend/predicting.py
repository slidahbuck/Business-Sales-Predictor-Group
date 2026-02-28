import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import TimeSeriesSplit


# =============================================================================
# CONFIG
# =============================================================================
TARGET_MAP = {
    'WomenClothing': ('women_train.csv', 'women_test.csv'),
    'MenClothing':   ('men_train.csv',   'men_test.csv'),
    'OtherClothing': ('other_train.csv',  'other_test.csv'),
}

TARGET_COLS = ['WomenClothing', 'MenClothing', 'OtherClothing']


# =============================================================================
# FEATURE ENGINEERING
# =============================================================================
def engineer_features(df):
    """Add engineered features to a dataframe (in-place safe copy)."""
    df = df.copy()

    # Cyclical month encoding
    df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)

    # Seasonal flags
    df['is_q4'] = (df['Month'] >= 10).astype(int)
    df['is_holiday_season'] = df['Month'].isin([11, 12]).astype(int)
    df['is_back_to_school'] = df['Month'].isin([7, 8]).astype(int)
    df['is_spring_shopping'] = df['Month'].isin([3, 4, 5]).astype(int)
    df['is_summer'] = df['Month'].isin([6, 7, 8]).astype(int)
    df['is_winter'] = df['Month'].isin([12, 1, 2]).astype(int)

    # Macro rate-of-change features
    if 'Monthly Real GDP Index (inMillion$)' in df.columns:
        df['GDP_ROC'] = df['Monthly Real GDP Index (inMillion$)'].pct_change()
    if 'CPI' in df.columns:
        df['CPI_ROC'] = df['CPI'].pct_change()
    if 'unemployment rate' in df.columns:
        df['Unemployment_Change'] = df['unemployment rate'].diff()

    return df


def add_lag_features(df, target_col):
    """Add lag features for the target column. Must be sorted chronologically."""
    df = df.copy()
    for lag in [1, 2, 3, 6, 12]:
        df[f'{target_col}_lag{lag}'] = df[target_col].shift(lag)
    return df


def get_feature_columns(df, target_col):
    """Select feature columns from whatever is available in the dataframe."""

    # Base time features
    features = ['Month_sin', 'Month_cos', 'Year']

    # Seasonal flags
    features += [
        'is_q4', 'is_holiday_season', 'is_back_to_school',
        'is_spring_shopping', 'is_summer', 'is_winter',
    ]

    # Macro features — grab whatever exists
    macro_candidates = [
        'Monthly Real GDP Index (inMillion$)', 'CPI',
        'unemployment rate', 'GDP_ROC', 'CPI_ROC', 'Unemployment_Change',
        'Cotton Monthly Price - US cents per Pound(lbs)',
        'Earnings or wages  in dollars per hour',
        'Exports', 'Change(in%)',
    ]
    features += macro_candidates

    # Holiday features — grab whatever exists
    holiday_candidates = [
        'has_christmas', 'has_thanksgiving', 'has_mothers_day',
        'has_fathers_day', 'has_valentines', 'has_easter', 'has_new_year',
    ]
    features += holiday_candidates

    # Lag features
    for lag in [1, 2, 3, 6, 12]:
        features.append(f'{target_col}_lag{lag}')

    # Only keep what actually exists in the dataframe
    return [f for f in features if f in df.columns]


# =============================================================================
# ENSEMBLE
# =============================================================================
def train_ensemble(X_train, y_train, X_val, y_val):
    """Train Ridge + GradientBoosting + RandomForest ensemble."""
    models = {}
    val_scores = {}

    ridge = Ridge(alpha=6)
    ridge.fit(X_train, y_train)
    ridge_mae = mean_absolute_error(y_val, ridge.predict(X_val))
    models['Ridge'] = ridge
    val_scores['Ridge'] = ridge_mae
    print(f"    Ridge  — Val MAE: {ridge_mae:.2f}")

    gb = GradientBoostingRegressor(
        n_estimators=300, max_depth=2, learning_rate=0.01,
        subsample=0.8, min_samples_leaf=3, random_state=42,
    )
    gb.fit(X_train, y_train)
    gb_mae = mean_absolute_error(y_val, gb.predict(X_val))
    models['GradientBoosting'] = gb
    val_scores['GradientBoosting'] = gb_mae
    print(f"    GBR    — Val MAE: {gb_mae:.2f}")

    rf = RandomForestRegressor(
        n_estimators=300, max_depth=3, min_samples_leaf=3, random_state=42,
    )
    rf.fit(X_train, y_train)
    rf_mae = mean_absolute_error(y_val, rf.predict(X_val))
    models['RandomForest'] = rf
    val_scores['RandomForest'] = rf_mae
    print(f"    RF     — Val MAE: {rf_mae:.2f}")

    return models, val_scores


def ensemble_predict(models, val_scores, X):
    """Inverse-MAE weighted average prediction."""
    if not models:
        return np.zeros(X.shape[0])

    inv = {k: 1.0 / (v + 1e-8) for k, v in val_scores.items()}
    total = sum(inv.values())
    weights = {k: v / total for k, v in inv.items()}

    preds = np.zeros(X.shape[0])
    for name, model in models.items():
        preds += weights[name] * model.predict(X)
    return preds


# =============================================================================
# FORECAST ONE CATEGORY
# =============================================================================
def forecast_category(category, train_path, test_path):
    """Load data, engineer features, train, and produce 12-month forecast."""
    print(f"\n{'='*60}")
    print(f"  {category}")
    print(f"{'='*60}")

    # Load CSVs
    train_df = pd.read_csv(train_path, index_col=0)
    test_df = pd.read_csv(test_path, index_col=0)

    # Sort chronologically
    train_df = train_df.sort_values(['Year', 'Month']).reset_index(drop=True)
    test_df = test_df.sort_values(['Year', 'Month']).reset_index(drop=True)

    # Engineer features on train
    train_df = engineer_features(train_df)
    train_df = add_lag_features(train_df, category)

    # Engineer features on test
    test_df = engineer_features(test_df)
    # Lag features for test will be filled during recursive prediction

    # Get feature columns
    features = get_feature_columns(train_df, category)
    print(f"  Using {len(features)} features")

    # Drop rows with NaN target or NaN features
    cols_needed = features + [category]
    clean = train_df[cols_needed].dropna()
    print(f"  Usable training rows: {len(clean)}")

    X = clean[features].values
    y = clean[category].values

    # ── Time-series cross-validation ──
    n_splits = min(3, len(clean) - 2)
    if n_splits >= 2:
        tscv = TimeSeriesSplit(n_splits=n_splits)
        cv_scores = []
        print(f"\n  Cross-validation ({n_splits}-fold temporal):")
        for fold, (tr_idx, va_idx) in enumerate(tscv.split(X)):
            X_tr, X_va = X[tr_idx], X[va_idx]
            y_tr, y_va = y[tr_idx], y[va_idx]
            m_fold, s_fold = train_ensemble(X_tr, y_tr, X_va, y_va)
            ens_pred = ensemble_predict(m_fold, s_fold, X_va)
            fold_mae = mean_absolute_error(y_va, ens_pred)
            cv_scores.append(fold_mae)
            print(f"    Fold {fold+1} Ensemble MAE: {fold_mae:.2f}")
        print(f"  Mean CV MAE: {np.mean(cv_scores):.2f} +/- {np.std(cv_scores):.2f}")

    # ── Train final models (80/20 for weighting) ──
    split = max(int(len(X) * 0.8), 1)
    final_models, final_scores = train_ensemble(
        X[:split], y[:split], X[split:], y[split:]
    )

    # ── Retrain on full data ──
    full_models = {}
    for name, model in final_models.items():
        clone = model.__class__(**model.get_params())
        clone.fit(X, y)
        full_models[name] = clone
        
    import joblib

    for name, model in full_models.items():
        filename = f"{category}_{name}.pkl"
        joblib.dump(model, filename)

joblib.dump(features, f"{category}_features.pkl")

    # ── Recursive 12-month forecast ──
    category_preds = []
    # Last known target values from training (for filling lags)
    known_values = train_df[category].dropna().tolist()

    for i in range(min(12, len(test_df))):
        row = test_df.iloc[i:i + 1].copy()

        # Add lag columns to row using known + predicted values
        history = known_values + category_preds
        for lag in [1, 2, 3, 6, 12]:
            col_name = f'{category}_lag{lag}'
            if len(history) >= lag:
                row[col_name] = history[-lag]
            elif col_name in train_df.columns:
                last = train_df[col_name].dropna()
                row[col_name] = last.iloc[-1] if len(last) > 0 else 0
            else:
                row[col_name] = 0

        # Build feature vector in correct order
        X_final = np.zeros((1, len(features)))
        for j, f in enumerate(features):
            if f in row.columns:
                val = row[f].values[0]
                X_final[0, j] = val if pd.notna(val) else 0
            elif f in train_df.columns:
                last = train_df[f].dropna()
                X_final[0, j] = last.iloc[-1] if len(last) > 0 else 0

        pred = ensemble_predict(full_models, final_scores, X_final)[0]
        pred = max(pred, 0)
        category_preds.append(round(pred, 2))

    # Pad if test_df had fewer than 12 rows
    while len(category_preds) < 12:
        category_preds.append(category_preds[-1] if category_preds else 0)

    print(f"\n  12-month forecast: {category_preds}")
    return category_preds


# =============================================================================
# MAIN
# =============================================================================
def main():
    print("=" * 60)
    print("  WALMART CLOTHING SALES PREDICTION")
    print("=" * 60)

    preds_by_category = {}

    for category in TARGET_COLS:
        train_path, test_path = TARGET_MAP[category]
        preds = forecast_category(category, train_path, test_path)
        preds_by_category[category] = preds

    # Build submission — ordered by month, cycling Women/Men/Other per month
    # Row 1: Month1 Women, Row 2: Month1 Men, Row 3: Month1 Other,
    # Row 4: Month2 Women, Row 5: Month2 Men, Row 6: Month2 Other, ...
    ordered_preds = []
    for month_idx in range(12):
        for category in TARGET_COLS:
            ordered_preds.append(preds_by_category[category][month_idx])

    submission = pd.DataFrame({
        'Year': range(1, 37),
        'Sales(In ThousandDollars)': ordered_preds,
    })
    submission.to_csv("submissions.csv", index=False)

    print(f"\n{'='*60}")
    print("  SUBMISSION SAVED — submissions.csv")
    print(f"{'='*60}")
    print(submission.to_string(index=False))

    return submission



print(f"  Saved models + features for {category}")
if __name__ == "__main__":
    main()

