import pandas as pd

def merge_volcanic_advisory(features_csv='dataset_v3_features.csv',
                            wovodat_csv='wovodat_v2.csv',
                            output_csv='dataset_v4_features.csv'):
    # load features dataset
    features_df = pd.read_csv(features_csv)
    
    # load processed wovodat alerts
    wovodat_df = pd.read_csv(wovodat_csv)
    
    # merge on row_id
    merged_df = features_df.merge(wovodat_df, on='row_id', how='left')
    
    # fill missing volcanic_advisory with 0
    merged_df['volcanic_advisory'] = merged_df['volcanic_advisory'].fillna(0).astype(int)
    
    # save merged dataset
    merged_df.to_csv(output_csv, index=False)
    print(f'✓ Merged dataset saved to {output_csv}')

if __name__ == "__main__":
    merge_volcanic_advisory()
