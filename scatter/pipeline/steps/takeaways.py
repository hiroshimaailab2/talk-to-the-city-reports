"""Create summaries for the clusters."""

from tqdm import tqdm
import os
import numpy as np
import pandas as pd
from langchain_openai import AzureChatOpenAI  # AOAI対応
from utils import messages, update_progress
import dotenv

dotenv.load_dotenv()  # 環境変数の読み込み

def request_to_chat_aoai(messages, model="gpt-4o"):
    """Azure OpenAI API経由でチャットリクエストを送信"""
    client = AzureChatOpenAI(
        model_name=model,
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT"),
        openai_api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        temperature=0.0
    )
    response = client(messages)
    return response.content.strip()


def takeaways(config):
    dataset = config['output_dir']
    path = f"outputs/{dataset}/takeaways.csv"

    arguments = pd.read_csv(f"outputs/{dataset}/args.csv")
    clusters = pd.read_csv(f"outputs/{dataset}/clusters.csv")

    results = pd.DataFrame()

    sample_size = config['takeaways']['sample_size']
    prompt = config['takeaways']['prompt']
    model = config['takeaways']['model']

    model = config.get('model_takeaways', config.get('model', 'gpt3.5-turbo'))
    cluster_ids = clusters['cluster-id'].unique()

    update_progress(config, total=len(cluster_ids))

    for _, cluster_id in tqdm(enumerate(cluster_ids), total=len(cluster_ids)):
        args_ids = clusters[clusters['cluster-id'] == cluster_id]['arg-id'].values
        args_ids = np.random.choice(args_ids, size=min(len(args_ids), sample_size), replace=False)
        args_sample = arguments[arguments['arg-id'].isin(args_ids)]['argument'].values
        label = generate_takeaways(args_sample, prompt, model)
        results = pd.concat([results, pd.DataFrame([{'cluster-id': cluster_id, 'takeaways': label}])], ignore_index=True)
        update_progress(config, incr=1)

    results.to_csv(path, index=False)


def generate_takeaways(args_sample, prompt, model):
    input_text = "\n".join(args_sample)
    messages_data = [
        {"role": "user", "content": prompt},
        {"role": "user", "content": input_text}
    ]
    response = request_to_chat_aoai(messages=messages_data, model=model)
    return response

