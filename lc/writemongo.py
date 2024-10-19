import json
import os

from tqdm.auto import tqdm
from dotenv import load_dotenv


from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi


load_dotenv()
uri = os.getenv("MONGO_URI")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["questions"]
collection = db["questions"]

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

with open("titles.json") as f:
    data = json.load(f)
    questions = data["data"]["problemsetQuestionList"]["questions"]
    for i, q in enumerate(tqdm(questions)):
        q_dict = {"title": q["title"], "titleSlug": q["titleSlug"], "difficulty": q["difficulty"],
                  "topicTags": [tag["name"] for tag in q["topicTags"]]}

        with open(f"content/{q['titleSlug']}.json", "r") as f:
            js = json.load(f)
            q_dict["content"] = js["data"]["question"]["content"]
            q_dict["schemas"] = js["data"]["question"]["mysqlSchemas"]

        collection.insert_one(q_dict)
