import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Video prompt is required"
      });
    }

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
        error: "Veo 2 generated a response but no video URL was returned."
      });
    }

    return res.status(200).json({
      success: true,
      status: "succeeded",
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error("Veo 2 Error:", error);

    return res.status(500).json({
      error: error.message || "Veo 2 video generation failed"
    });
  }
}
