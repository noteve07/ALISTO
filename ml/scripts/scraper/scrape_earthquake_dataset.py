import os
import requests
import csv
import json
from bs4 import BeautifulSoup
from datetime import datetime
from dateutil.relativedelta import relativedelta
from pathlib import Path
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)



# start date of dataset (adjust if necessary)
START_MONTH = "January"
START_YEAR = "2018"

# current date (to determine end of dataset)
NOW = datetime.now()
CURRENT_MONTH = NOW.strftime("%B")
CURRENT_YEAR = str(NOW.year)



def get_month_year():
    # create start and end dates
    start_date = datetime.strptime(f"{START_MONTH} {START_YEAR}", "%B %Y")
    end_date = datetime.strptime(f"{CURRENT_MONTH} {CURRENT_YEAR}", "%B %Y")

    # generate list of (month, year) tuples from start date to end date
    dates = []
    current = start_date
    while current <= end_date:
        dates.append((current.strftime("%B"), str(current.year)))
        current += relativedelta(months=1)
    return dates



def scrape(month: str, year: str):
    print(f"Scraping data for {month} {year}...")

    # determine filename and directory
    raw_dir = Path(__file__).parent.parent.parent / 'dataset' / 'earthquake' / 'raw'
    os.makedirs(raw_dir, exist_ok=True)
    month_num = datetime.strptime(month, "%B").strftime("%m")
    raw_filename = f'{raw_dir}/raw_eq_data_{year}_{month_num}.csv'

    # if filename already exist, skip
    if os.path.exists(raw_filename):
        print(f"File already exists: {raw_filename}. Skipping...")
        return

    # determine URL to scrape
    if month == CURRENT_MONTH and year == CURRENT_YEAR:
        url = 'https://earthquake.phivolcs.dost.gov.ph/'
    else:
        url = f'https://earthquake.phivolcs.dost.gov.ph/EQLatest-Monthly/{year}/{year}_{month}.html'

    # log for a bit
    print(f"Saving to: {raw_filename}")
    print(f"URL: {url}")

    # verify connection and get page content
    try:
        response = requests.get(url, verify=False, timeout=10)
        if response.status_code != 200:
            print(f"[ERROR] Failed to retrieve data for {month} {year}. Status code: {response.status_code}")
            with open(raw_dir / 'missing_files.log', 'a') as log_file:
                log_file.write(f"{year}_{month}.html\n")
            return
    except requests.RequestException as e:
        print(f"[ERROR] Exception occurred for {url}: {e}")
        log_missing_file(raw_dir, year, month)
        return
    
    # parse HTML content
    soup = BeautifulSoup(response.content, 'html.parser')
    rows = soup.select('table tr')  
    data_rows = [r for r in rows if len(r.find_all("td")) == 6]
    if not data_rows:
        print(f"[ERROR] No data found for {month} {year}.")
        log_missing_file(raw_dir, year, month)
        return

    # write to CSV
    with open (raw_filename, 'w', newline='', encoding='utf-8') as csvfile:
        csvwriter = csv.writer(csvfile)
        # write header
        csvwriter.writerow(['date_time', 'latitude', 'longitude', 'depth', 'magnitude', 'location'])
        # write data rows
        for row in data_rows:
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            csvwriter.writerow(cells)
        print(f"Data for {month} {year} saved successfully.")



def log_missing_file(raw_dir, year, month):
    with open(raw_dir / 'missing_files.log', 'a') as log_file:
        log_file.write(f"{year}_{month}.html\n")
    return


if __name__ == "__main__":
    # start scraping earthquake dataset from January 2018
    dates = get_month_year()
    for month, year in dates:
        scrape(month, year)
