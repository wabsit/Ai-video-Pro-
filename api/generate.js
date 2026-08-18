export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "REPLICATE_API_TOKEN is missing"
    });
  }

  try {
    if (req.method === "POST") {
      const { prompt } = req.body || {};

      if (!prompt) {
        return res.status(400).json({
          error: "Video prompt is required"
        });
      }

      const r = await fetch(
        "https://api.replicate.com/v1/models/minimax/video-01/predictions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            input: {
              prompt: prompt
            }
          })
        }
      );

      const data = await r.json();

      console.log("REPLICATE:", data);

      if (!r.ok) {
        return res.status(r.status).json({
          error: data.detail || data.error || "Replicate request failed"
        });
      }

      return res.status(200).json({
        success: true,
        id: data.id,
        status: data.status,
        output: data.output || null
      });
    }

    if (req.method === "GET") {
      const id = req.query.id;

      if (!id) {
        return res.status(400).json({
          error: "Prediction ID is required"
        });
      }

      const r = await fetch(
        `https://api.replicate.com/v1/predictions/${id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await r.json();

      return res.status(r.status).json({
        success: r.ok,
        id: data.id,
        status: data.status,
        output: data.output || null,
        error: data.error || null
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
