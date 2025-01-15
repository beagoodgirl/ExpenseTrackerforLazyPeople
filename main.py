from fastapi import FastAPI, Body,Request
from gpt import GptPrompt
from base64ToSrc import ToSrc
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Hello there"}

@app.post("/gpt")
async def read_item(request: Request):
    data = await request.json()
    image_src = data['image_src']
    response = GptPrompt().generate(image_src)
    
    return response

@app.post("/upload")
async def read_item(request: Request):
    data = await request.json()
    image_src = data['image_src']
    response = ToSrc().tosrc(image_src)
    
    return response
