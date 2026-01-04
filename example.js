// example.js

const RAPIDAPI_KEY = "your_rapidapi_key_here";

// RapidAPI endpoint for creating generation tasks
const CREATE_TASK_URL = "https://aqua-api.p.rapidapi.com/v1/images/generations";

// Image generation parameters
const QUERY_PARAMS = new URLSearchParams({
  prompt: "sakura tree in full bloom by a lake at sunset",
  model: "nanobanana-pro",
  ratio: "square"
  // image: "your_image_url_path"
});

// Request headers
const HEADERS = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": "aqua-api.p.rapidapi.com",
  "Content-Type": "application/json"
};

// Utility: sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImageAndPoll() {
  try {
    // --- Step 1: Create image generation task ---
    console.log("🚀 Creating image generation task...");

    const createRes = await fetch(
      `${CREATE_TASK_URL}?${QUERY_PARAMS.toString()}`,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({})
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("❌ Failed to create task:", errText);
      return;
    }

    const taskData = await createRes.json();

    const taskId = taskData.task_id;
    const pollUrl = taskData.url; // Direct polling URL (quota-free)

    if (!taskId || !pollUrl) {
      console.error("❌ Invalid response:", taskData);
      return;
    }

    console.log("✅ Task created successfully!");
    console.log("🆔 Task ID:", taskId);
    console.log("🔗 Polling URL (quota-free):", pollUrl);

    // --- Step 2: Poll task status ---
    console.log("⏳ Waiting for image generation...");

    const startTime = Date.now();

    while (true) {
      let result;

      try {
        const statusRes = await fetch(pollUrl);
        result = await statusRes.json();
      } catch (err) {
        console.warn("⚠️ Polling error:", err.message);
        await sleep(10000);
        continue;
      }

      const status = result.status;

      if (status === "completed") {
        const imageUrl = result?.result?.url;
        console.log("\n🎉 Image generation completed!");
        console.log("🖼️ Image URL:", imageUrl);
        break;
      }

      if (status === "failed") {
        console.log("\n❌ Image generation failed.");
        break;
      }

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(
        `   [Elapsed: ${elapsed}s] Status: ${status}... checking again in 10 seconds\r`
      );

      // Wait 10 seconds to avoid Cloudflare rate limits
      await sleep(10000);
    }

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run
generateImageAndPoll();
