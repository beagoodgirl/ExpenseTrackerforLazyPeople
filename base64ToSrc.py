import requests
import traceback

class ToSrc:
    def __init__(self):
        pass
    
    def tosrc(self, image_src):
        # 上傳到 Imgur 產生短網址
        self.client_id = '8ccbcfcd6e4a1a9'
        url = "https://api.imgur.com/3/image"
        headers = {
            "Authorization": f"Client-ID {self.client_id}"
        }
        data = {
            'image': image_src[23:],
            'type': 'base64'
        }
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            print(response.json()['data']['link'])
        else:
            print(f"Error: {response.status_code}, {response.text}")
        return response.json()['data']['link']