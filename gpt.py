from openai import AzureOpenAI
import requests
import traceback
import yaml

class GptPrompt:
    def __init__(self):
        self.AZURE_OPEN_AI_MODEL = "GPT-4o"
    
    def generate(self, image_src):
        client = AzureOpenAI(
            # https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#rest-api-versioning
            api_version="2023-07-01-preview",
            # https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal#create-a-resource
            azure_endpoint="https://fcuaiopenaieastus.openai.azure.com/",
            api_key="82090bbea75c43f690443a567511d83d"
        )
        
        # read yaml
        with open("prompt.yml", 'r', encoding='utf-8') as file:
            prompt = yaml.load(file, Loader=yaml.FullLoader)
            receiptPrompt = prompt['receiptPrompt']

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
        
        message_text = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": receiptPrompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                        "url": f"{response.json()['data']['link']}"
                        }
                    }
                ]
            }
        ]
        # noinspection PyBroadException
        if self.AZURE_OPEN_AI_MODEL == 'GPT-4o':
            try:
                completion = client.chat.completions.create(
                    model="GPT-4o", # model = "deployment_name"
                    messages = message_text,
                    response_format={"type": "json_object"},
                    temperature=0.7,
                    max_tokens=300,
                    top_p=0.28,
                    frequency_penalty=0,
                    presence_penalty=0,
                    stop=None
                )
                print(completion.choices[0].message.content)
                return completion.choices[0].message.content
            except Exception:
                return traceback.format_exc()
        else:
            try:
                completion = client.chat.completions.create(
                    model = self.AZURE_OPEN_AI_MODEL,
                    messages=message_text,
                    temperature=0.7,
                    max_tokens=800,
                    top_p=0.95,
                    frequency_penalty=0,
                    presence_penalty=0,
                    stop=None,
                )
                print(completion.choices[0].message.content)
                return completion.choices[0].message.content
            except Exception:
                return traceback.format_exc()