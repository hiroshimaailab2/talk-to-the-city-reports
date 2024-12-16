import time
from langchain_openai import AzureOpenAIEmbeddings
import pandas as pd
from tqdm import tqdm
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv("../../.env")


def embed_by_openai(args):
    embeds = AzureOpenAIEmbeddings(
        model=os.getenv("AZURE_EMBEDDING_MODEL"),
        azure_endpoint=os.getenv("AZURE_EMBEDDING_ENDPOINT"),
        openai_api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        openai_api_version=os.getenv("AZURE_EMBEDDING_API_VERSION")
    ).embed_documents(args)
    return embeds

def embedding(config):
    dataset = config['output_dir']
    path = f"outputs/{dataset}/embeddings.pkl"
    arguments = pd.read_csv(f"outputs/{dataset}/args.csv")
    embeddings = []
    batch_size = 1000
    for i in tqdm(range(0, len(arguments), batch_size)):
        args = arguments["argument"].tolist()[i: i + batch_size]
        embeds = embed_by_openai(args)
        embeddings.extend(embeds)
    df = pd.DataFrame(
        [
            {"arg-id": arguments.iloc[i]["arg-id"], "embedding": e}
            for i, e in enumerate(embeddings)
        ]
    )
    df.to_pickle(path)

