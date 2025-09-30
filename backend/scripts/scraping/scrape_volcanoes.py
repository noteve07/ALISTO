import os
from bs4 import BeautifulSoup
import re
import requests
import urllib3
from urllib.parse import urljoin
import time

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def scrape_volcano_data(url=None):
    """
    Scrapes volcano data from PHIVOLCS website or HTML file
    Returns list of volcano data including name, date, iframe link, and alert level
    """
    if url:
        # Fetch the HTML content from the URL
        print(f"Fetching volcano data from URL: {url}")
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            response = requests.get(url, headers=headers, timeout=30, verify=False)
            response.raise_for_status()  # Raise exception for HTTP errors
            html_content = response.text
            print(f"✅ Successfully fetched data from PHIVOLCS website ({len(html_content)} bytes)")
        except requests.RequestException as e:
            print(f"❌ Error fetching PHIVOLCS website: {str(e)}")
            return []
    else:
        print("❌ No URL or file path provided")
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all second-column divs (English versions)
    second_columns = soup.find_all('div', class_='col-sm-6 second-column')
    
    volcano_data_list = []
    
    for column in second_columns:
        volcano_data = {}
        
        # Get the text content
        text_p = column.find('p', style=lambda x: x and 'font-size:18px' in x)
        if text_p:
            full_text = text_p.get_text(strip=True)
            
            # Extract volcano name (first word before "Volcano")
            volcano_match = re.match(r'(\w+)\s+Volcano', full_text)
            if volcano_match:
                volcano_data['volcano_name'] = volcano_match.group(1)
            
            # Extract date (pattern: DD Month YYYY)
            date_match = re.search(r'(\d{1,2}\s+\w+\s+\d{4})', full_text)
            if date_match:
                volcano_data['date'] = date_match.group(1)
        
        # Prefer the <a> href (absolute URL) so we can fetch live alert level
        anchor = column.find('a', href=True)
        if anchor:
            href = anchor['href']
            base_url = 'https://wovodat.phivolcs.dost.gov.ph'
            full_url = urljoin(base_url + '/', href)
            volcano_data['iframe_link'] = full_url

            # Try fetching the target page to extract the alert level
            try:
                resp = requests.get(full_url, timeout=15, verify=False)
                if resp.ok:
                    iframe_soup = BeautifulSoup(resp.text, 'html.parser')
                    circle_div = iframe_soup.find('div', class_='circle')
                    if circle_div:
                        alert_text = circle_div.get_text(strip=True)
                        volcano_data['alert_level'] = alert_text
                    else:
                        volcano_data['alert_level'] = 'Not found'
                else:
                    volcano_data['alert_level'] = f'HTTP {resp.status_code}'
            except requests.RequestException as e:
                volcano_data['alert_level'] = f'Network error: {str(e)}'
        else:
            # Fallback to iframe src
            iframe = column.find('iframe')
            if iframe and iframe.get('src'):
                iframe_src = iframe.get('src')
                volcano_data['iframe_link'] = iframe_src
                # Since we're scraping from web, we'll try to follow the iframe source if it's a URL
                if iframe_src.startswith('http'):
                    try:
                        iframe_resp = requests.get(iframe_src, timeout=15, verify=False)
                        if iframe_resp.ok:
                            iframe_soup = BeautifulSoup(iframe_resp.text, 'html.parser')
                            circle_div = iframe_soup.find('div', class_='circle')
                            if circle_div:
                                alert_text = circle_div.get_text(strip=True)
                                volcano_data['alert_level'] = alert_text
                            else:
                                volcano_data['alert_level'] = 'Alert level not found in iframe'
                        else:
                            volcano_data['alert_level'] = f'HTTP {iframe_resp.status_code}'
                    except requests.RequestException as e:
                        volcano_data['alert_level'] = f'Iframe fetch error: {str(e)}'
                else:
                    volcano_data['alert_level'] = 'Cannot fetch relative iframe src'
        
        volcano_data_list.append(volcano_data)
    
    return volcano_data_list


def print_volcano_data(volcano_data_list):
    """
    Pretty print the volcano data
    """
    print("=" * 80)
    print("VOLCANO DATA SCRAPING RESULTS")
    print("=" * 80)
    
    for i, data in enumerate(volcano_data_list, 1):
        print(f"\n{'='*80}")
        print(f"VOLCANO #{i}")
        print(f"{'='*80}")
        print(f"Volcano Name:  {data.get('volcano_name', 'N/A')}")
        print(f"Date:          {data.get('date', 'N/A')}")
        print(f"Iframe Link:   {data.get('iframe_link', 'N/A')}")
        print(f"Alert Level:   {data.get('alert_level', 'N/A')}")
    
    print(f"\n{'='*80}")
    print(f"Total volcanoes found: {len(volcano_data_list)}")
    print("=" * 80)


if __name__ == "__main__":
    # PHIVOLCS bulletin URL - using the correct URL
    phivolcs_url = "https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin"
    
    # Scrape the data directly from the PHIVOLCS website
    print("🌋 Starting Philippine Volcanoes Scraper...")
    volcano_data = scrape_volcano_data(phivolcs_url)
    
    # Print the results
    print_volcano_data(volcano_data)
    
    # Optionally, we could save the data to a file or database here
    print("\n💾 To save this data to database, run init_volcanoes_data.py with the updated data")
