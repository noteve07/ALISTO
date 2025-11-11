import pandas as pd

def process_wovodat(input_csv='wovodat.csv', output_csv='wovodat_v2.csv'):
    # load wovodat alerts
    df = pd.read_csv(input_csv)
    
    # convert datetime to date
    df['date'] = pd.to_datetime(df['DateTime']).dt.date
    
    # add advisory column (1 if alert exists)
    df['volcanic_advisory'] = 1
    
    # create row_id in same format as features dataset
    df['row_id'] = df['Province'] + '_' + df['date'].apply(lambda x: x.strftime('%Y_%m_%d'))
    
    # keep only relevant columns
    output_df = df[['row_id', 'volcanic_advisory']].drop_duplicates()
    
    # save to csv
    output_df.to_csv(output_csv, index=False)
    print(f'✓ Processed WOVODAT saved to {output_csv}')

if __name__ == "__main__":
    process_wovodat()
