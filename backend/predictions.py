import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt
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
        'has_new_year': 'New Year' 
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

    macro_df = pd.read_excel("backend/walmart-sales-prediction-hyd-nov-2023/macro_economic.xlsx")

    weather_df = pd.read_excel("backend/walmart-random/WeatherData.xlsx")

    weather_df['Month'] = le.fit_transform(weather_df['Month'])
    weather_df['WeatherEvent'] = le.fit_transform(weather_df['WeatherEvent'])

    columns_to_convert = ['Wind (km/h) low', 'Wind (km/h) avg', 'Wind (km/h) high', 'Precip. (mm) sum']

    for column in columns_to_convert:
        print(f"Processing column: {column}")
        
        if column in weather_df.columns:
            weather_df[column] = pd.to_numeric(weather_df[column], errors='coerce')
        else:
            print(f"Column '{column}' not found in weather_df.")

    holiday_df = pd.read_excel("backend/walmart-random/Events_holidaysData.xlsx", dtype={'MonthDate': str})

    holiday_df.insert(loc=2, column="Day", value=holiday_df['MonthDate'].str[2:4].astype(int))
    holiday_df.insert(loc=1, column="Month", value=holiday_df['MonthDate'].str[5:7].astype(int))

    holiday_df = holiday_df.drop(columns="MonthDate")

    years_to_remove = [2015, 2016]
    holiday_df = holiday_df[~holiday_df["Year"].isin(years_to_remove)]

    holiday_df = holiday_df.sort_values(['Year', 'Month'])

    holiday_flags = create_specific_holiday_flags(holiday_df)

    # holiday_df.to_csv("holiday_df.csv", index=False, encoding='utf-8')

    # holiday_df['has_christmas'] = 

    # holiday_df['Event'] = le.fit_transform(holiday_df['Event'])
    # holiday_df['DayCategory'] = le.fit_transform(holiday_df['DayCategory'])

    year_month = macro_df["Year-Month"]

    years = []
    months = []

    months_mapping = {
        "Jan": 1,
        "Feb": 2,
        "Mar": 3,
        "Apr": 4,
        "May": 5,
        "Jun": 6,
        "Jul": 7,
        "Aug": 8,
        "Sep": 9,
        "Oct": 10,
        "Nov": 11,
        "Dec": 12
        }

    for item in year_month:
        year_month_split = item.split("-")
        years.append(int(year_month_split[0].strip()))
        months.append(months_mapping[year_month_split[1].strip()])
        
    macro_df.insert(loc=0, column="Year", value = years)
    macro_df.insert(loc=1, column="Month", value = months)
    macro_df = macro_df.drop(columns="Year-Month")

    macro_df = macro_df[~macro_df["Year"].isin(years_to_remove)]

    clothing_data = pd.read_csv("backend/train.csv")

    pivoted_data = clothing_data.pivot(
        index=['Year', 'Month'],
        columns='ProductCategory',
        values='Sales(In ThousandDollars)'
    )

    training = pivoted_data.copy()
    for col in ['MenClothing', 'OtherClothing', 'WomenClothing']:
        training[col] = training[col].interpolate(method='linear')

    macro_df = pd.merge(macro_df, training, on=['Year', 'Month'], how='left')

    macro_df = macro_df.drop(columns=["Cotton Monthly Price - US cents per Pound(lbs)", "Average upland harvested(million acres)"])

    macro_df["PartyInPower"] = le.fit_transform(macro_df["PartyInPower"])

    holiday_features = holiday_df.groupby(['Year', 'Month']).agg({
        'DayCategory': 'sum',  
        'Event': ['count', 'nunique']  
    }).reset_index()

    holiday_features.columns = ['Year', 'Month', 'holiday_count', 'total_events', 'unique_events']

    merged_df = macro_df.merge(holiday_features, on=['Year', 'Month'], how='left')

    merged_df = merged_df.drop(columns="AdvertisingExpenses (in Thousand Dollars)")

    merged_df[['holiday_count', 'total_events', 'unique_events']] = \
        merged_df[['holiday_count', 'total_events', 'unique_events']].fillna(0)

    weather_df = weather_df.sort_values(['Year', 'Month']) 

    # print(merged_df.info())
    # print(merged_df.duplicated().sum())
    # print(merged_df.describe())

    merged_df["Month"] = np.cos(2 * np.pi * merged_df['Month'] / 12)


    merged_df['WomenClothing_lag1'] = merged_df['WomenClothing'].shift(1)
    merged_df['WomenClothing_lag3'] = merged_df['WomenClothing'].shift(3)
    merged_df['WomenClothing_lag12'] = merged_df['WomenClothing'].shift(12)

    merged_df['MenClothing_lag1'] = merged_df['MenClothing'].shift(1)
    merged_df['MenClothing_lag3'] = merged_df['MenClothing'].shift(3)
    merged_df['MenClothing_lag12'] = merged_df['MenClothing'].shift(12)

    merged_df['OtherClothing_lag1'] = merged_df['OtherClothing'].shift(1)
    merged_df['OtherClothing_lag3'] = merged_df['OtherClothing'].shift(3)
    merged_df['OtherClothing_lag12'] = merged_df['OtherClothing'].shift(12)

    merged_df['RollingMensClothing-3'] = merged_df['MenClothing'].rolling(window=3).mean()
    merged_df['RollingMensClothing-6'] = merged_df['MenClothing'].rolling(window=6).mean()

    merged_df['RollingWomensClothing-3'] = merged_df['WomenClothing'].rolling(window=3).mean()
    merged_df['RollingWomensClothing-6'] = merged_df['WomenClothing'].rolling(window=6).mean()

    merged_df['RollingOtherClothing-3'] = merged_df['OtherClothing'].rolling(window=3).mean()
    merged_df['RollingOtherClothing-6'] = merged_df['OtherClothing'].rolling(window=6).mean()

    merged_df['GDP-ROC'] = merged_df['Monthly Real GDP Index (inMillion$)'].pct_change()
    merged_df['CPI-ROC'] = merged_df['CPI'].pct_change()
    merged_df['Unemployment-Change'] = merged_df['unemployment rate'].diff()


    train_df = merged_df[merged_df['WomenClothing'].notna()].copy()
    test_df = merged_df[merged_df['WomenClothing'].isna()].copy()   

    # Visualize your sales data
    # plt.figure(figsize=(12, 6))
    # plt.plot(merged_df['Month'], label='Women')
    # plt.legend()
    # plt.title('Sales Over Time')
    # plt.show()
    

    train_df.to_csv("trainin.csv", index=False, encoding='utf-8')
    test_df.to_csv("testin.csv", index=False, encoding='utf-8')

preprocess_data()

# Load the training data
data = pd.read_csv("backend/trainin.csv")
data = data.sort_values(['Year', 'Month'])

# Parameters
sequence_length = 12

# Function to create sequences for regression
def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i + seq_length])
        y.append(data[i + seq_length])
    return np.array(X), np.array(y)

# Function to train Linear Regression model for a category
def train_linear_model(category_data, seq_length=12):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(category_data.reshape(-1, 1))
    
    X, y = create_sequences(scaled_data.flatten(), seq_length)
    
    # Create and train linear regression model
    model = LinearRegression()
    model.fit(X, y)
    
    return model, scaler

# List to store all predictions in order
all_predictions = []

# Train models and make predictions for each category
for category in ['WomenClothing', 'MenClothing', 'OtherClothing']:
    print(f"Training model for {category}...")
    
    category_series = data[category].dropna().values
    model, scaler = train_linear_model(category_series, sequence_length)
    
    last_sequence = category_series[-sequence_length:]
    scaled_sequence = scaler.transform(last_sequence.reshape(-1, 1)).flatten()
    current_sequence = scaled_sequence.copy()
    
    # Predict 12 months ahead for this category
    category_predictions = []
    for month in range(12):
        X_pred = current_sequence.reshape(1, -1)
        pred_scaled = model.predict(X_pred)[0]
        pred_value = scaler.inverse_transform([[pred_scaled]])[0][0]
        category_predictions.append(round(pred_value, 2))
        
        # Update sequence: remove first element, add prediction
        current_sequence = np.append(current_sequence[1:], pred_scaled)
    
    # Add this category's predictions to the overall list
    all_predictions.extend(category_predictions)
    print(f"Completed {category}")

submission = pd.DataFrame({
    'Year': range(1, 37),  
    'Sales(In ThousandDollars)': all_predictions
})

submission.to_csv("submissions.csv", index=False)
print("Predictions saved to submissions.csv")