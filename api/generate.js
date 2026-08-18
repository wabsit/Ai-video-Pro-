import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Only POST requests are allowed"
      });
    }

    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      return res.status(500).json({
        success: false,
        error: "REPLICATE_API_TOKEN is missing"
      });
    }

    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Video prompt is required"
      });
    }

    const replicate = new Replicate({
      auth: token
    });

    const output = await replicate.run("google/veo-2", {
      input: {
        prompt: prompt.trim()
      }
    });

    let videoUrl = null;

    if (typeof output === "string") {
      videoUrl = output;
    } else if (output && typeof output.url === "function") {
      videoUrl = output.url();
    }

    if (!videoUrl) {
      return res.status(500).json({
        success: false,
        error: "Veo 2 did not return a video URL"
      });
    }

    return res.status(200).json({
      success: true,
      status: "succeeded",
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error("REPLICATE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || String(error)
    });
  }
}
