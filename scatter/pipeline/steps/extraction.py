import os
import json
from tqdm import tqdm
import pandas as pd
from langchain_openai import AzureChatOpenAI
from utils import messages, update_progress
import concurrent.futures
import re
import logging
import dotenv

COMMA_AND_SPACE_AND_RIGHT_BRACKET = re.compile(r",\s*(\])")


def extraction(config):
    dataset = config["output_dir"]
    path = f"outputs/{dataset}/args.csv"
    comments = pd.read_csv(f"inputs/{config['input']}.csv")

    model = config["extraction"]["model"]
    prompt = config["extraction"]["prompt"]
    workers = config["extraction"]["workers"]
    limit = config["extraction"]["limit"]

    comment_ids = (comments["comment-id"].values)[:limit]
    comments.set_index("comment-id", inplace=True)
    results = pd.DataFrame()
    update_progress(config, total=len(comment_ids))

    existing_arguments = set()

    for i in tqdm(range(0, len(comment_ids), workers)):
        batch = comment_ids[i : i + workers]
        batch_inputs = [comments.loc[id]["comment-body"] for id in batch]
        batch_results = extract_batch(batch_inputs, prompt, model, workers)
        for comment_id, extracted_args in zip(batch, batch_results):
            for j, arg in enumerate(extracted_args):
                if arg not in existing_arguments:
                    new_row = {
                        "arg-id": f"A{comment_id}_{j}",
                        "comment-id": int(comment_id),
                        "argument": arg,
                    }
                    results = pd.concat(
                        [results, pd.DataFrame([new_row])], ignore_index=True
                    )
                    existing_arguments.add(arg)
        update_progress(config, incr=len(batch))
    results.to_csv(path, index=False)


logging.basicConfig(level=logging.ERROR)


def extract_batch(batch, prompt, model, workers):
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures_with_index = [
            (i, executor.submit(extract_arguments, input, prompt, model))
            for i, input in enumerate(batch)
        ]

        done, not_done = concurrent.futures.wait([f for _, f in futures_with_index], timeout=30)
        results = [[] for _ in range(len(batch))]

        for _, future in futures_with_index:
            if future in not_done and not future.cancelled():
                future.cancel()

        for i, future in futures_with_index:
            if future in done:
                try:
                    result = future.result()
                    results[i] = result
                except Exception as e:
                    logging.error(f"Task {future} failed with error: {e}")
                    results[i] = []
        return results


def extract_by_llm(input, prompt, model):
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": input},
    ]
    response = request_to_chat_aoai(messages=messages, model=model)
    return response


def extract_arguments(input, prompt, model, retries=1):
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": input},
    ]
    try:
        response = request_to_chat_aoai(messages=messages, model=model)
        response = (
            COMMA_AND_SPACE_AND_RIGHT_BRACKET.sub(r"\1", response)
            .replace("```json", "")
            .replace("```", "")
        )
        obj = json.loads(response)
        # LLM sometimes returns valid JSON string
        if isinstance(obj, str):
            obj = [obj]
        try:
            items = [a.strip() for a in obj]
        except Exception as e:
            print("Error:", e)
            print("Input was:", input)
            print("Response was:", response)
            print("JSON was:", obj)
            print("skip")
            items = []
        items = filter(None, items)  # omit empty strings
        return items
    except json.decoder.JSONDecodeError as e:
        print("JSON error:", e)
        print("Input was:", input)
        print("Response was:", response)
        print("Silently giving up on trying to generate valid list.")
        return []

def request_to_chat_aoai(messages, model="gpt-4o"):
    # AOAI 環境設定
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION")

    # Azure ChatOpenAI インスタンス作成
    llm = AzureChatOpenAI(
        model_name=model,
        azure_endpoint=endpoint,
        openai_api_key=api_key,
        openai_api_version=api_version,
        temperature=0.0
    )
    response = llm(messages)
    return response.content.strip()

