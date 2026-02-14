import pandas as pd
import numpy as np
import matplotlib.pyplot as plt 
import seaborn as sns
from sklearn.preprocessing import LabelEncoder

"""
TODO: 
 - [ ]  fill NAN values in the clothing data so that it isn't a problem BEFORE merging with holiday data
 - [x]  add valentines to the womens clothing thingy

"""


"""




"""
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

# import all necessary data 
all_sheets = pd.read_excel("backend/walmart-sales-prediction-hyd-nov-2023/WeatherData.xlsx", sheet_name=None)
frames = []
for sheet_name, df in all_sheets.items():
    df["Year"] = int(sheet_name)
    frames.append(df)
weather_df = pd.concat(frames, ignore_index=True)
weather_df.columns = weather_df.columns.str.strip()
weather_df.columns = weather_df.columns.str.replace('\xa0', ' ')
macro_df = pd.read_excel("backend/walmart-sales-prediction-hyd-nov-2023/macro_economic.xlsx")
holiday_df = pd.read_excel("backend/walmart-random/Events_holidaysData.xlsx", dtype={"MonthDate": str})
clothing_data = pd.read_csv("backend/walmart-sales-prediction-hyd-nov-2023/train.csv")


# remove years that wont be used in predictions 
weather_df = weather_df[~weather_df["Year"].isin(YEARS_TO_REMOVE)]
holiday_df = holiday_df[~holiday_df["Year"].isin(YEARS_TO_REMOVE)]

# pivot data to create individual categories for each clothing type
clothing_data = clothing_data.pivot(index=["Year", "Month"], columns="ProductCategory", values="Sales(In ThousandDollars)").ffill()

# create individual datasets for each clothing data 
clothing_data_men = clothing_data.drop(columns=['WomenClothing', 'OtherClothing'])
clothing_data_women = clothing_data.drop(columns=['MenClothing', 'OtherClothing'])
clothing_data_other = clothing_data.drop(columns=['MenClothing', 'WomenClothing'])

# define new names for weather values 
numeric_cols = [
    'Temp high (°C)', 'Temp avg (°C)', 'Temp low (°C)',
    'Humidity (%) avg', 'Precip. (mm) sum','Visibility (km) avg','Wind (km/h) avg'
]

# get rid of random T values in weather dataframe 
for column in numeric_cols:
      weather_df[column] = weather_df[column].replace("T", 0.01)
      weather_df[column] = pd.to_numeric(weather_df[column], errors='coerce')

# format and map months in weather df 
weather_df['Month'] = weather_df['Month'].str.strip().str[:3]  
weather_df['Month'] = weather_df['Month'].map(MONTHS_MAPPING)  

# feature engineer has rain fog and snow columns
weather_df['has_rain'] = weather_df['WeatherEvent'].str.contains("Rain", na=False).astype(int)
weather_df['has_snow'] = weather_df['WeatherEvent'].str.contains("Snow", na=False).astype(int)
weather_df['has_fog'] = weather_df['WeatherEvent'].str.contains("Fog", na=False).astype(int)

# create aggregate values for certain weather_df columns
weather_df = weather_df.groupby(['Year', 'Month'], dropna=False).agg(
    temp_avg=('Temp avg (°C)', 'mean'),
    temp_high_max=('Temp high (°C)', 'max'),
    precip_total=('Precip. (mm) sum', 'sum'),
    humidity_avg=('Humidity (%) avg', 'mean'),
    visibility=('Visibility (km) avg', 'mean'),
    wind=('Wind (km/h) avg', 'mean'),
    rainy_days=('has_rain', 'sum'),
    snowy_days=('has_snow', 'sum'),
    foggy_days=('has_fog', 'sum'),
).reset_index()

# names for holidays and what to use to find them in holiday df 
holidays = {
    'has_mothers_day': 'Mother',
    'has_fathers_day': 'Father',
    'has_christmas': 'Christmas',
    'has_valentines': 'Valentines'
}

# create features like has_christmas for each month if it says christmas in each row etc... 
for holiday in holidays:
    holiday_df[holiday] = holiday_df['Event'].str.contains(holidays[holiday], na=False).astype(int)

# create month column for holiday df according to weird formatted monthdate 
holiday_df['MonthDate'] = holiday_df['MonthDate'].str.strip()
holiday_df['Month'] = holiday_df['MonthDate'].str[5:7].astype(int)
holiday_df = holiday_df.drop(columns='MonthDate')

# create individual datasets for men, women, and other pertaining to what aggregate features should be in each 
holiday_df_women = holiday_df.groupby(['Year', 'Month'], dropna=False).agg(
    has_christmas=("has_christmas", 'sum'),
    has_mothers_day=("has_mothers_day", 'sum'),
    has_valentines=("has_valentines", 'sum')
).astype(bool)

holiday_df_men = holiday_df.groupby(['Year', 'Month'], dropna=False).agg(
    has_fathers_day=('has_fathers_day', 'sum'),
    has_christmas=("has_christmas", 'sum'),
).astype(bool)

holiday_df_other = holiday_df.groupby(['Year', 'Month'], dropna=False).agg(
    has_christmas=("has_christmas", 'sum'),
).astype(bool)

# format false true to 0 1 
holiday_df_men = holiday_df_men.astype(int)
holiday_df_women = holiday_df_women.astype(int)
holiday_df_other = holiday_df_other.astype(int)

# create index instance from weatherdf 
full_index = pd.MultiIndex.from_frame(weather_df[['Year', 'Month']].drop_duplicates().sort_values(['Year', 'Month']))

# reindex holiday df 
holiday_df_men = holiday_df_men.reindex(full_index, fill_value=0)
holiday_df_women = holiday_df_women.reindex(full_index, fill_value=0)
holiday_df_other = holiday_df_other.reindex(full_index, fill_value=0)

# merge clothing data with holiday data 
men_merged = holiday_df_men.merge(clothing_data_men, on=['Year', 'Month'], how='left')
women_merged = holiday_df_women.merge(clothing_data_women, on=['Year', 'Month'], how='left')
other_merged = holiday_df_other.merge(clothing_data_other, on=['Year', 'Month'], how='left')

# formatting macro df yearmonth column to years and months 
macro_df['Year-Month'] = macro_df['Year-Month'].str.split("-")

years = []
months = []

# append years to years and moths to months based on index in split year month column
for each in macro_df['Year-Month']:
    years.append(each[0].strip())
    months.append(each[1].strip())

# drop yearmonth column
macro_df = macro_df.drop(columns='Year-Month')

# insert new columns with values years and months
macro_df.insert(loc=0, column='Year', value=years)
macro_df.insert(loc=1, column='Month', value=months)

# map the months function and make sure years is an int 
macro_df['Month'] = macro_df['Month'].map(MONTHS_MAPPING)
macro_df['Year'] = macro_df['Year'].astype(int)

# drop unnecessary features to lower confusion with model
macro_df = macro_df.drop(columns=[
     'PartyInPower',
     'Monthly Nominal GDP Index (inMillion$)',
     'AdvertisingExpenses (in Thousand Dollars)',
     'Mill use  (in  480-lb netweright in million bales)',
     'Production (in  480-lb netweright in million bales)',
     'yieldperharvested acre',
     'Average upland harvested(million acres)',
     'Average upland planted(million acres)',
     'CommercialBankInterestRateonCreditCardPlans',
     'Finance Rate on Personal Loans at Commercial Banks, 24 Month Loan',
])

# remove 2015 and 2016
macro_df = macro_df[~macro_df['Year'].isin(YEARS_TO_REMOVE)]

# merge with macro dataframe 
men_merged = macro_df.merge(men_merged, on=['Year', 'Month'], how='left')
women_merged = macro_df.merge(women_merged, on=['Year', 'Month'], how='left')
other_merged = macro_df.merge(other_merged, on=['Year', 'Month'], how='left')

men_train = men_merged[men_merged['MenClothing'].notna()].copy()
men_test = men_merged[men_merged['MenClothing'].isna()].copy()

women_train = women_merged[women_merged['WomenClothing'].notna()].copy()
women_test = women_merged[women_merged['WomenClothing'].isna()].copy()

other_train = other_merged[other_merged['OtherClothing'].notna()].copy()
other_test = other_merged[other_merged['OtherClothing'].isna()].copy()

men_train.to_csv("men_train.csv")
men_test.to_csv("men_test.csv")

women_train.to_csv("women_train.csv")
women_test.to_csv("women_test.csv")

other_train.to_csv("other_train.csv")
other_test.to_csv("other_test.csv")

