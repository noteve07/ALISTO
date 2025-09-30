import os
import re
import json
import requests
import urllib3
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def extract_bulletin_iframes(url):
    """
    Extract volcano bulletin iframes from PHIVOLCS website
    Returns list of iframe data with volcano info
    """
    print(f"Fetching bulletin data from: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        response = requests.get(url, headers=headers, timeout=30, verify=False)
        response.raise_for_status()
        html_content = response.text
        print(f"✅ Successfully fetched bulletin page ({len(html_content)} bytes)")
    except requests.RequestException as e:
        print(f"❌ Error fetching bulletin page: {str(e)}")
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    iframe_elements = soup.find_all('iframe', class_='iframe-thumb')
    
    if not iframe_elements:
        print("❌ No iframe elements found on the page")
        return []
    
    print(f"Found {len(iframe_elements)} bulletin iframes")
    
    bulletin_data = []
    base_url = "https://wovodat.phivolcs.dost.gov.ph"
    
    for idx, iframe in enumerate(iframe_elements, 1):
        data = {}
        
        # Get the iframe src
        src = iframe.get('src')
        if src:
            # Make sure we have absolute URL
            if src.startswith('/'):
                full_url = urljoin(base_url, src)
            else:
                full_url = src
                
            data['iframe_url'] = full_url
            data['bulletin_id'] = extract_bulletin_id(full_url)
            
            print(f"Processing iframe #{idx}: {full_url}")
            
            # Fetch the iframe content
            try:
                iframe_response = requests.get(full_url, headers=headers, timeout=15, verify=False)
                iframe_response.raise_for_status()
                iframe_html = iframe_response.text
                
                # Parse volcano information from the iframe
                iframe_soup = BeautifulSoup(iframe_html, 'html.parser')
                
                # Get title/name
                title_elem = iframe_soup.find('h2')
                if title_elem:
                    title_text = title_elem.get_text(strip=True)
                    data['title'] = title_text
                    
                    # Try to extract volcano name
                    volcano_match = re.search(r'(\w+)\s+Volcano', title_text)
                    if volcano_match:
                        data['volcano_name'] = volcano_match.group(1)
                    else:
                        # Fallback: first word might be the volcano name
                        data['volcano_name'] = title_text.split()[0] if title_text else None
                
                # Get date
                date_elem = iframe_soup.select_one('.date-issue')
                if date_elem:
                    data['issue_date'] = date_elem.get_text(strip=True)
                
                # Get alert level
                circle_div = iframe_soup.find('div', class_='circle')
                if circle_div:
                    alert_text = circle_div.get_text(strip=True)
                    data['alert_level'] = alert_text
                
                # Get content
                content_div = iframe_soup.find('div', class_='content')
                if content_div:
                    data['content'] = content_div.get_text(strip=True)
                
                bulletin_data.append(data)
                print(f"✅ Extracted data for {data.get('volcano_name', 'Unknown Volcano')}, Alert Level: {data.get('alert_level', 'N/A')}")
                
            except requests.RequestException as e:
                print(f"❌ Error fetching iframe {full_url}: {str(e)}")
                data['error'] = str(e)
                bulletin_data.append(data)
    
    return bulletin_data

def extract_bulletin_id(url):
    """Extract bulletin ID from URL"""
    match = re.search(r'bid=(\d+)', url)
    return match.group(1) if match else None

def save_data_to_json(data, output_file):
    """Save scraped data to JSON file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Data saved to {output_file}")

def main():
    """Main function to scrape and save volcano bulletin data"""
    print("=" * 80)
    print("🌋 PHIVOLCS VOLCANO BULLETIN IFRAME SCRAPER")
    print("=" * 80)
    
    # PHIVOLCS bulletin URL
    bulletin_url = "https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin"
    
    # Extract bulletin data
    bulletin_data = extract_bulletin_iframes(bulletin_url)
    
    # Print summary
    print("\n" + "=" * 80)
    print(f"SUMMARY: Found {len(bulletin_data)} volcano bulletins")
    print("=" * 80)
    
    if bulletin_data:
        # Save to JSON file
        output_file = os.path.join(os.path.dirname(__file__), "volcano_bulletin_data.json")
        save_data_to_json(bulletin_data, output_file)
        
        print("\nVolcano Names:")
        for item in bulletin_data:
            alert = item.get('alert_level', 'N/A')
            name = item.get('volcano_name', 'Unknown')
            print(f"- {name} (Alert Level: {alert})")
    else:
        print("❌ No bulletin data extracted")

if __name__ == "__main__":
    main()