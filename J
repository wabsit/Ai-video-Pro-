export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  try {
    const { prompt, model, duration, ratio } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Video prompt is required"
      });
    }

    return res.status(200).json({
      success: true,
      message: "AI Video request received",
      prompt,
      model: model || "free",
      duration: duration || "5",
      ratio: ratio || "9:16"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
