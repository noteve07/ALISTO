import os
from bs4 import BeautifulSoup
import re
import requests
import urllib3
from urllib.parse import urljoin

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def scrape_volcano_data(html_file_path):
    """
    Scrapes volcano data from PHIVOLCS HTML file
    Returns list of volcano data including name, date, iframe link, and alert level
    """
    # Read the main HTML file
    with open(html_file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
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
            # Fallback to iframe src on local file (offline mode)
            iframe = column.find('iframe')
            if iframe and iframe.get('src'):
                iframe_src = iframe.get('src')
                volcano_data['iframe_link'] = iframe_src
                iframe_file_path = os.path.join(os.path.dirname(html_file_path), iframe_src.replace('./', ''))
                try:
                    with open(iframe_file_path, 'r', encoding='utf-8') as iframe_file:
                        iframe_content = iframe_file.read()
                    iframe_soup = BeautifulSoup(iframe_content, 'html.parser')
                    circle_div = iframe_soup.find('div', class_='circle')
                    if circle_div:
                        alert_text = circle_div.get_text(strip=True)
                        volcano_data['alert_level'] = alert_text
                    else:
                        volcano_data['alert_level'] = 'Not found'
                except FileNotFoundError:
                    volcano_data['alert_level'] = 'Iframe file not found'
                except Exception as e:
                    volcano_data['alert_level'] = f'Error reading iframe: {str(e)}'
        
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
    # Path to the HTML file
    html_file = os.path.join(
        os.path.dirname(__file__),
        'PHIVOLCS-LAVA_ Show of Bulletin.html'
    )
    
    # Scrape the data
    volcano_data = scrape_volcano_data(html_file)
    
    # Print the results
    print_volcano_data(volcano_data)
