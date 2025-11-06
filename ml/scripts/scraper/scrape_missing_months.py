import os
import requests
import csv
from bs4 import BeautifulSoup
from datetime import datetime
from pathlib import Path
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def scrape_month(month: str, year: str):
    """
    Scrape earthquake data for a specific month and year
    """
    print(f"\n{'='*60}")
    print(f"Scraping data for {month} {year}...")
    print(f"{'='*60}")

    # determine filename and directory
    raw_dir = Path(__file__).parent.parent.parent / 'dataset' / 'earthquake' / 'raw'
    os.makedirs(raw_dir, exist_ok=True)
    month_num = datetime.strptime(month, "%B").strftime("%m")
    raw_filename = f'{raw_dir}/raw_eq_data_{year}_{month_num}.csv'

    # if filename already exist, skip
    if os.path.exists(raw_filename):
        print(f"✓ File already exists: {raw_filename}")
        print(f"  Skipping...")
        return

    # determine URL to scrape
    url = f'https://earthquake.phivolcs.dost.gov.ph/EQLatest-Monthly/{year}/{year}_{month}.html'

    print(f"📁 Saving to: {raw_filename}")
    print(f"🌐 URL: {url}")

    # verify connection and get page content
    try:
        response = requests.get(url, verify=False, timeout=10)
        if response.status_code != 200:
            print(f"❌ [ERROR] Failed to retrieve data for {month} {year}.")
            print(f"   Status code: {response.status_code}")
            log_missing_file(raw_dir, year, month)
            return
    except requests.RequestException as e:
        print(f"❌ [ERROR] Exception occurred for {url}")
        print(f"   {type(e).__name__}: {e}")
        log_missing_file(raw_dir, year, month)
        return
    
    # parse HTML content
    soup = BeautifulSoup(response.content, 'html.parser')
    rows = soup.select('table tr')  
    data_rows = [r for r in rows if len(r.find_all("td")) == 6]
    
    if not data_rows:
        print(f"❌ [ERROR] No data found for {month} {year}.")
        log_missing_file(raw_dir, year, month)
        return

    # write to CSV
    try:
        with open(raw_filename, 'w', newline='', encoding='utf-8') as csvfile:
            csvwriter = csv.writer(csvfile)
            # write header
            csvwriter.writerow(['date_time', 'latitude', 'longitude', 'depth', 'magnitude', 'location'])
            # write data rows
            for row in data_rows:
                cells = [td.get_text(strip=True) for td in row.find_all("td")]
                csvwriter.writerow(cells)
            print(f"✓ Data for {month} {year} saved successfully!")
            print(f"  Total records: {len(data_rows)}")
    except Exception as e:
        print(f"❌ [ERROR] Failed to write CSV file")
        print(f"   {type(e).__name__}: {e}")
        log_missing_file(raw_dir, year, month)
        return


def log_missing_file(raw_dir, year, month):
    """
    Log missing or failed files
    """
    log_file = raw_dir / 'missing_files.log'
    with open(log_file, 'a') as f:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{timestamp}] {year}_{month}.html\n")
    print(f"  Logged to: {log_file}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SCRAPING MISSING EARTHQUAKE DATA")
    print("="*60)
    
    # Scrape September and October 2025
    months_to_scrape = [
        ("September", "2025"),
        ("October", "2025"),
    ]
    
    for month, year in months_to_scrape:
        scrape_month(month, year)
    
    print("\n" + "="*60)
    print("Scraping completed!")
    print("="*60 + "\n")
