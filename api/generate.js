export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  try {
    const {
      prompt,
      model = "free",
      duration = "5",
      ratio = "9:16"
    } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Video prompt is required"
      });
    }

    // Video generation request
    const videoRequest = {
      prompt: prompt.trim(),
      model,
      duration,
      ratio
    };

    /*
      IMPORTANT:
      यहाँ अभी कोई fake video URL नहीं बनाया गया है।
      Real AI Video API को यहाँ connect किया जाएगा।
    */

    return res.status(200).json({
      success: true,
      status: "ready",
      message: "Video generation request is ready.",
      request: videoRequest
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
