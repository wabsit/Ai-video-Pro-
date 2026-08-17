document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt");
  const imageInput = document.getElementById("image");
  const modelInput = document.getElementById("model");
  const durationInput = document.getElementById("duration");
  const ratioInput = document.getElementById("ratio");
  const generateBtn = document.getElementById("generateBtn");
  const preview = document.getElementById("preview");

  if (!generateBtn) return;

  generateBtn.addEventListener("click", generateVideo);

  async function generateVideo() {
    const prompt = promptInput?.value.trim();

    if (!prompt) {
      showMessage("⚠️ पहले Video Prompt लिखें।");
      promptInput?.focus();
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = "⏳ Generating...";

    showLoading();

    try {
      const formData = new FormData();

      formData.append("prompt", prompt);
      formData.append("model", modelInput?.value || "free");
      formData.append("duration", durationInput?.value || "5");
      formData.append("ratio", ratioInput?.value || "9:16");

      if (imageInput?.files?.length) {
        formData.append("image", imageInput.files[0]);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData
      });

      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          "Server ने JSON के बजाय यह response दिया: " +
          text.substring(0, 150)
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Video generation failed");
      }

      /*
       * API इनमें से किसी नाम से video URL भेज सकती है:
       * videoUrl / url / video_url
       */
      const videoUrl =
        data.videoUrl ||
        data.url ||
        data.video_url ||
        data.output?.videoUrl ||
        data.output?.url;

      if (!videoUrl) {
        throw new Error(
          data.message ||
          "API ने अभी MP4 video URL नहीं दिया।"
        );
      }

      showVideo(videoUrl);

    } catch (error) {
      console.error("VIDEO ERROR:", error);

      showError(
        "❌ Video generation में समस्या आई।",
        error.message
      );
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = "🚀 Generate Video";
    }
  }

  function showLoading() {
    preview.innerHTML = `
      <div class="video-status">
        <div class="loading-circle">⏳</div>
        <h3>Video Generating...</h3>
        <p>कृपया थोड़ा इंतजार करें।</p>
      </div>
    `;
  }

  function showVideo(videoUrl) {
    preview.innerHTML = `
      <div class="generated-video">

        <video
          id="generatedVideo"
          controls
          playsinline
          preload="metadata"
        >
          <source src="${escapeHtml(videoUrl)}" type="video/mp4">
          आपका browser video playback support नहीं करता।
        </video>

        <div class="video-actions">

          <button
            type="button"
            id="playVideoBtn"
            class="video-action-btn"
          >
            ▶️ Play
          </button>

          <a
            id="downloadVideoBtn"
            class="video-action-btn download-btn"
            href="${escapeHtml(videoUrl)}"
            download="ai-video.mp4"
            target="_blank"
            rel="noopener"
          >
            ⬇️ Download MP4
          </a>

        </div>

      </div>
    `;

    const video = document.getElementById("generatedVideo");
    const playBtn = document.getElementById("playVideoBtn");

    playBtn.addEventListener("click", async () => {
      try {
        if (video.paused) {
          await video.play();
          playBtn.innerHTML = "⏸️ Pause";
        } else {
          video.pause();
          playBtn.innerHTML = "▶️ Play";
        }
      } catch (error) {
        console.error(error);
      }
    });

    video.addEventListener("play", () => {
      playBtn.innerHTML = "⏸️ Pause";
    });

    video.addEventListener("pause", () => {
      playBtn.innerHTML = "▶️ Play";
    });
  }

  function showMessage(message) {
    preview.innerHTML = `
      <div class="video-status">
        <div class="loading-circle">ℹ️</div>
        <h3>${escapeHtml(message)}</h3>
      </div>
    `;
  }

  function showError(title, message) {
    preview.innerHTML = `
      <div class="video-status error-box">
        <div class="loading-circle">❌</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
