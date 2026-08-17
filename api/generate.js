export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  try {
    const { prompt, duration, ratio } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Video prompt is required"
      });
    }

    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "REPLICATE_API_TOKEN is not configured"
      });
    }

    // Veo 3 currently generates short clips.
    // Long 5–10 minute videos will be built from multiple clips later.
    const requestedMinutes = Number(duration || 5);

    const videoDuration = 8;

    const aspectRatio =
      ratio === "9:16" ? "9:16" :
      ratio === "1:1" ? "16:9" :
      "16:9";

    const response = await fetch(
      "https://api.replicate.com/v1/models/google/veo-3/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify({
          input: {
            prompt: prompt.trim(),
            duration: videoDuration,
            resolution: "720p",
            aspect_ratio: aspectRatio,
            generate_audio: true
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Replicate error:", data);

      return res.status(response.status).json({
        error:
          data.detail ||
          data.error ||
          "Replicate video generation failed"
      });
    }

    const videoUrl =
      typeof data.output === "string"
        ? data.output
        : Array.isArray(data.output)
          ? data.output[0]
          : null;

    if (videoUrl) {
      return res.status(200).json({
        success: true,
        status: "completed",
        videoUrl,
        requestedMinutes
      });
    }

    return res.status(200).json({
      success: true,
      status: data.status || "processing",
      predictionId: data.id,
      requestedMinutes,
      message: "Video generation is still processing."
    });

  } catch (error) {
    console.error("Generate API error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
          }
