import pandas as pd
import glob
import os
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


input_directory = './walmart-sales-prediction-hyd-nov-2023'
output_csv = 'merged_output.csv'

excel_files = glob.glob(os.path.join(input_directory, '*.xlsx'))

df_list = []

for file in excel_files:
    df = pd.read_excel(file) 
    df['source_file'] = os.path.basename(file)
    df_list.append(df) 

merged_df = pd.concat(df_list, ignore_index=True)
merged_df.to_csv(output_csv, index=False, encoding='utf-8')

data = pd.read_csv("merged_output.csv")

year_month = data["Year-Month"]

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
    
data.insert(loc=0, column="Year", value = years)
data.insert(loc=1, column="Month", value = months)
data = data.drop(columns="Year-Month")

values_to_remove = [2015, 2016]
data = data[~data["Year"].isin(values_to_remove)]

data = data.drop(columns="source_file")

data.to_csv("new_output.csv", index=False, encoding='utf-8')

clothing_data = pd.read_csv("train.csv")

pivoted_data = clothing_data.pivot(
    index=['Year', 'Month'],
    columns='ProductCategory',
    values='Sales(In ThousandDollars)'
)

training = pivoted_data.copy()
for col in ['MenClothing', 'OtherClothing', 'WomenClothing']:
    training[col] = training[col].interpolate(method='linear')

training.to_csv("training.csv", index=True, encoding='utf-8')

merged_df = pd.merge(data, training, on=['Year', 'Month'], how='left')

merged_df.to_csv("train1.csv", index=False, encoding='utf-8')