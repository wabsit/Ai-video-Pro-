document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt");
  const imageInput = document.getElementById("image");
  const modelInput = document.getElementById("model");
  const durationInput = document.getElementById("duration");
  const ratioInput = document.getElementById("ratio");
  const generateBtn = document.getElementById("generateBtn");
  const preview = document.getElementById("preview");

  if (!generateBtn || !preview) {
    console.error("Required elements not found.");
    return;
  }

  generateBtn.addEventListener("click", generateVideo);

  async function generateVideo() {
    const prompt = promptInput.value.trim();

    if (!prompt) {
      showMessage("⚠️ पहले अपना Video Prompt लिखें।");
      promptInput.focus();
      return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "⏳ Processing...";

    showLoading();

    try {
      const formData = new FormData();

      formData.append("prompt", prompt);
      formData.append(
        "model",
        modelInput?.value || "free"
      );
      formData.append(
        "duration",
        durationInput?.value || "5"
      );
      formData.append(
        "ratio",
        ratioInput?.value || "9:16"
      );

      if (imageInput?.files?.length > 0) {
        formData.append("image", imageInput.files[0]);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        throw new Error(
          "API ने JSON response नहीं दिया। Server/API check करें।"
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Video generation failed."
        );
      }

      const videoUrl =
        data.videoUrl ||
        data.video_url ||
        data.url ||
        data.output?.videoUrl ||
        data.output?.video_url ||
        data.output?.url;

      if (!videoUrl) {
        showPlanReady(data);
        return;
      }

      showVideo(videoUrl);

    } catch (error) {
      console.error("Video Error:", error);

      showError(
        "❌ Video generation failed",
        error.message
      );
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "🚀 Generate Video";
    }
  }


  function showLoading() {
    preview.innerHTML = `
      <div class="video-status">
        <div class="play-icon">⏳</div>

        <h3>Creating Your Video...</h3>

        <p>
          AI आपका video तैयार कर रहा है।
        </p>

        <small>
          Please wait...
        </small>
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
          <source
            src="${escapeHTML(videoUrl)}"
            type="video/mp4"
          >

          आपका browser video playback support नहीं करता।
        </video>

        <div class="video-actions">

          <button
            id="playVideoBtn"
            class="video-action-btn"
            type="button"
          >
            ▶️ Play
          </button>

          <a
            class="video-action-btn download-btn"
            href="${escapeHTML(videoUrl)}"
            download="ai-video-pro.mp4"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⬇️ Download MP4
          </a>

        </div>

      </div>
    `;

    const video =
      document.getElementById("generatedVideo");

    const playButton =
      document.getElementById("playVideoBtn");

    if (!video || !playButton) return;

    playButton.addEventListener("click", async () => {
      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        console.error(error);
      }
    });

    video.addEventListener("play", () => {
      playButton.textContent = "⏸️ Pause";
    });

    video.addEventListener("pause", () => {
      playButton.textContent = "▶️ Play";
    });
  }


  function showPlanReady(data) {
    preview.innerHTML = `
      <div class="video-status">

        <div class="play-icon">✅</div>

        <h3>Video Request Received</h3>

        <p>
          AI Video API ने आपकी request receive कर ली।
        </p>

        <small>
          ${escapeHTML(
            data.message ||
            "Video URL अभी उपलब्ध नहीं है।"
          )}
        </small>

      </div>
    `;
  }


  function showMessage(message) {
    preview.innerHTML = `
      <div class="video-status">

        <div class="play-icon">ℹ️</div>

        <h3>${escapeHTML(message)}</h3>

      </div>
    `;
  }


  function showError(title, message) {
    preview.innerHTML = `
      <div class="video-status error-box">

        <div class="play-icon">❌</div>

        <h3>${escapeHTML(title)}</h3>

        <p>${escapeHTML(message)}</p>

      </div>
    `;
  }


  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "
