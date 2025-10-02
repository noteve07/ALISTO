# Earthquake Data Seeding

This directory contains the script to seed historical earthquake data into the Supabase database.

## Files

- `cleaned_v2_eq_data.csv` - Historical earthquake data from 2018-01-01 to 2025-09-30 (107,326 records)
- `init_earthquakes_data.py` - Python script to seed the database

## Usage

### Prerequisites

1. Make sure you have set up your `.env` file with Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

2. Activate the virtual environment:
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. Make sure the `provinces` table is already populated with province data

### Running the Script

```bash
cd backend/scripts/database/earthquakes
python init_earthquakes_data.py
```

The script will:
1. Show current database statistics
2. Ask for confirmation before proceeding
3. Clear existing earthquake data (if confirmed)
4. Process CSV from oldest to newest (bottom to top)
5. Insert data in batches of 100 records

## Features

### Data Processing

- **Order**: Processes from oldest (2018-01-01) to newest (2025-09-30)
- **eq_id**: Auto-increments starting from 1 for the oldest earthquake
- **eq_hash**: SHA-256 hash of timestamp + magnitude + location (with salt for duplicates)
- **Timestamp**: Stored as-is from CSV (no timezone conversion)
- **Coordinates**: PostGIS POINT(longitude, latitude) format

### Province Matching

The script uses a 3-tier approach to match provinces:

1. **Direct Name Match**: Matches province name from CSV to provinces table
2. **Nearest Province**: If name not found, calculates nearest province using Haversine distance
3. **Null Fallback**: If no province name provided, sets province_id to NULL

### Logging

The script logs:
- Progress updates every 100 records
- Province matching issues (when province not found in database)
- Nearest province calculations
- Duplicate hash detections and rehashing
- Final statistics (total inserted, errors, missing provinces)

## Example Output

```
============================================================
🚀 EARTHQUAKE DATA SEEDING SCRIPT
============================================================

📊 Current database state:
📊 Current earthquakes in database: 0

============================================================
❓ Do you want to seed earthquake data? (this will CLEAR existing data) [y/N]: y
============================================================
🗑️  Clearing existing earthquake data...
✅ Existing data cleared

🌍 Starting Earthquake Data Seeding...
============================================================
📍 Loading province data from database...
✅ Loaded 81 provinces (81 with centroids)
📂 Reading CSV file: cleaned_v2_eq_data.csv
✅ Loaded 107326 earthquake records (oldest to newest)

📊 Total records to process: 107326
📦 Batch size: 100
🔢 Starting eq_id: 1 (oldest earthquake)
============================================================
✅ Batch    1: Inserted 100 records | Total:    100/107326 (  0.09%)
✅ Batch    2: Inserted 100 records | Total:    200/107326 (  0.19%)
...
```

## Notes

- The script is designed to be idempotent (can be run multiple times)
- Make sure you have enough space in your Supabase database
- The entire process may take several minutes depending on connection speed
- If interrupted, you can restart from scratch (it will clear and re-seed)

