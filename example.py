import requests
import time

# ================= Configuration =================

# 1. Your RapidAPI Key (REPLACE THIS)
RAPIDAPI_KEY = "your_rapidapi_key_here"

# 2. RapidAPI endpoint for creating generation tasks
CREATE_TASK_URL = "https://aqua-api.p.rapidapi.com/v1/images/generations"

# 3. Image generation parameters
QUERY_PARAMS = {
    "prompt": "sakura tree in full bloom by a lake at sunset",
    "model": "nanobanana-pro",
    "ratio": "square"
    #"image": "your_image_url_path"
}

# 4. Request headers
HEADERS = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": "aqua-api.p.rapidapi.com",
    "Content-Type": "application/json"
}

# ================================================


def generate_image_and_poll():
    # --- Step 1: Create image generation task ---
    print("🚀 Creating image generation task...")

    response = requests.post(
        CREATE_TASK_URL,
        headers=HEADERS,
        params=QUERY_PARAMS,
        json={}
    )

    if response.status_code != 200:
        print(f"❌ Failed to create task: {response.text}")
        return

    task_data = response.json()

    task_id = task_data.get("task_id")
    poll_url = task_data.get("url")  # Direct polling URL (quota-free)

    if not task_id or not poll_url:
        print("❌ Invalid response: missing task_id or polling URL")
        print(task_data)
        return

    print(f"✅ Task created successfully!")
    print(f"🆔 Task ID: {task_id}")
    print(f"🔗 Polling URL (quota-free): {poll_url}")

    # --- Step 2: Poll task status ---
    print("⏳ Waiting for image generation...")

    start_time = time.time()

    while True:
        try:
            # Poll the direct URL (does NOT consume RapidAPI quota)
            status_response = requests.get(poll_url)
            result = status_response.json()
        except Exception as e:
            print(f"⚠️ Polling error: {e}")
            time.sleep(10)
            continue

        status = result.get("status")

        if status == "completed":
            image_url = result.get("result", {}).get("url")
            print("\n🎉 Image generation completed!")
            print(f"🖼️ Image URL: {image_url}")
            break

        if status == "failed":
            print("\n❌ Image generation failed.")
            break

        elapsed = int(time.time() - start_time)
        print(
            f"   [Elapsed: {elapsed}s] Status: {status}... checking again in 10 seconds",
            end="\r"
        )

        # Wait 10 seconds to avoid Cloudflare rate limits
        time.sleep(10)


if __name__ == "__main__":
    generate_image_and_poll()
