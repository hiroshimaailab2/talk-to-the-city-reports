"""Create summaries for the clusters."""

from tqdm import tqdm
import os
import numpy as np
import pandas as pd
from langchain_openai import AzureChatOpenAI  # AOAI対応
from utils import messages, update_progress


def request_to_chat_aoai(messages, model="gpt-4o"):
    """AOAI API経由でチャットリクエストを送信."""
    # AOAI専用設定（APIキー、エンドポイント取得）
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION")

    # AzureChatOpenAI クライアントのインスタンスを作成し、リクエストを送信
    client = AzureChatOpenAI(
        model=model,
        azure_endpoint=endpoint,
        openai_api_key=api_key,
        openai_api_version=api_version,
        temperature=0.0
    )
    response = client(messages)
    return response.content.strip()


def overview(config):
    dataset = config['output_dir']
    path = f"outputs/{dataset}/overview.txt"

    takeaways = pd.read_csv(f"outputs/{dataset}/takeaways.csv")
    labels = pd.read_csv(f"outputs/{dataset}/labels.csv")

    prompt = config['overview']['prompt']
    model = config['overview']['model']

    ids = labels['cluster-id'].to_list()
    takeaways.set_index('cluster-id', inplace=True)
    labels.set_index('cluster-id', inplace=True)

    input_text = ''
    for i, id in enumerate(ids):
        input_text += f"# Cluster {i+1}/{len(ids)}: {labels.loc[id]['label']}\n\n"

        # NaNチェックを追加し、欠損値の場合には空文字列に置き換え
        takeaways_text = takeaways.loc[id]['takeaways']
        if pd.isna(takeaways_text):
            takeaways_text = ''
        input_text += str(takeaways_text) + '\n\n'

    messages = [
        {"role": "user", "content": prompt},
        {"role": "user", "content": input_text}
    ]
    response = request_to_chat_aoai(messages=messages, model=model)  # AOAI対応関数

    with open(path, 'w') as file:
        file.write(response)
