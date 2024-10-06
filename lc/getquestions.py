import json
import os

import dotenv
import requests

dotenv.load_dotenv()

url = "https://leetcode.com/graphql/"
query = """
query questionContent($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    content
    mysqlSchemas
  }
}
"""


headers = {
    "Cookie": os.getenv("COOKIE"),
    "Content-Type": "application/json"
}

with open("titles.json") as f:
    data = json.load(f)
    questions = data["data"]["problemsetQuestionList"]["questions"]
    slugs = [q["titleSlug"] for q in questions]

for slug in slugs:
    variables = {"titleSlug": slug}
    r = requests.get(url, json={"query": query, "variables": variables}, headers=headers)
    js = r.json()
    with open(f"content/{slug}.json", "w") as f:
        json.dump(js, f)
