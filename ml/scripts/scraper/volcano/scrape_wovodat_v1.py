import requests
import urllib3

# suppress insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# url to scrape
url = "https://wovodat.phivolcs.dost.gov.ph/volcan/raising-alert?volcan=574&sdate=&edate=&btn-search="

try:
    # send GET request with SSL verification disabled
    response = requests.get(url, verify=False)

    if response.status_code == 200:
        html = response.text
        print(html)  # print full html
    else:
        print(f"Failed to fetch page, status code: {response.status_code}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
