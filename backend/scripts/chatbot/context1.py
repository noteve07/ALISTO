import requests

# api endpoint
url = "http://127.0.0.1:8000/api/v1/earthquakes/latest"

try:
    # send get request to api
    response = requests.get(url)

    # check if response is ok
    if response.status_code == 200:
        data = response.json()
        print("latest earthquake data:")
        print(response.text)
        # print(data)
    else:
        print(f"failed to fetch data. status code: {response.status_code}")

except requests.exceptions.RequestException as e:
    print("error occurred:", e)
