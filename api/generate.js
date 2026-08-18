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

    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "REPLICATE_API_TOKEN is missing in Vercel"
      });
    }

    const createResponse = await fetch(
      "https://api.replicate.com/v1/models/google/veo-3/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: {
            prompt: prompt.trim(),
            duration: 8,
            aspect_ratio: "16:9",
            resolution: "720p",
            generate_audio: true
          }
        })
      }
    );

    const prediction = await createResponse.json();

    if (!createResponse.ok) {
      return res.status(createResponse.status).json({
        error:
          prediction.detail ||
          prediction.error ||
          "Replicate request failed"
      });
    }

    return res.status(200).json({
      success: true,
      status: prediction.status,
      predictionId: prediction.id,
      videoUrl: prediction.output || null,
      getUrl: prediction.urls?.get || null
    });

  } catch (error) {
    console.error("Generate error:", error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
      }
