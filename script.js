const promptInput = document.getElementById("prompt");
const modelInput = document.getElementById("model");
const durationInput = document.getElementById("duration");
const ratioInput = document.getElementById("ratio");

const generateButton =
  document.getElementById("generateBtn") ||
  document.querySelector("button");

async function generateVideo() {
  const prompt = promptInput?.value.trim();

  if (!prompt) {
    alert("Please describe your video first.");
    return;
  }

  generateButton.disabled = true;
  generateButton.innerText = "⏳ Starting...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        model: modelInput?.value || "free",
        duration: durationInput?.value || "5",
        ratio: ratioInput?.value || "16:9"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to start video");
    }

    if (!data.id) {
      throw new Error("Prediction ID was not received.");
    }

    await checkVideoStatus(data.id);

  } catch (error) {
    console.error(error);
    alert("❌ " + error.message);
    generateButton.disabled = false;
    generateButton.innerText = "🚀 Generate Video";
  }
}


async function checkVideoStatus(predictionId) {
  generateButton.innerText = "⏳ Generating...";

  const response = await fetch(
    `/api/generate?id=${encodeURIComponent(predictionId)}`
  );

  const data = await response.json();

  console.log("Video status:", data);

  if (!response.ok) {
    throw new Error(data.error || "Status check failed");
  }

  if (data.status === "succeeded") {
    const videoUrl = getVideoUrl(data.output);

    if (!videoUrl) {
      throw new Error("Video completed but MP4 URL was not found.");
    }

    showVideo(videoUrl);

    generateButton.disabled = false;
    generateButton.innerText = "🚀 Generate Video";
    return;
  }

  if (
    data.status === "failed" ||
    data.status === "canceled"
  ) {
    throw new Error(
      data.error || `Video ${data.status}`
    );
  }

  // starting / processing
  generateButton.innerText = "⏳ Video is processing...";

  setTimeout(() => {
    checkVideoStatus(predictionId);
  }, 3000);
}


function getVideoUrl(output) {
  if (!output) return null;

  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    return output[0] || null;
  }

  if (typeof output === "object") {
    return output.url || output.video || null;
  }

  return null;
}


function showVideo(videoUrl) {
  const preview =
    document.querySelector(".video-preview") ||
    document.querySelector("#videoPreview") ||
    document.body;

  let video = document.getElementById("generatedVideo");

  if (!video) {
    video = document.createElement("video");
    video.id = "generatedVideo";

    video.controls = true;
    video.playsInline = true;

    video.style.width = "100%";
    video.style.maxWidth = "700px";
    video.style.marginTop = "20px";
    video.style.borderRadius = "16px";

    preview.appendChild(video);
  }

  video.src = videoUrl;
  video.load();

  addDownloadButton(videoUrl);
}


function addDownloadButton(videoUrl) {
  let button = document.getElementById("downloadVideo");

  if (!button) {
    button = document.createElement("a");
    button.id = "downloadVideo";

    button.innerText = "⬇️ Download MP4";

    button.style.display = "inline-block";
    button.style.marginTop = "15px";
    button.style.padding = "12px 20px";
    button.style.borderRadius = "10px";
    button.style.background = "#e91e63";
    button.style.color = "white";
    button.style.textDecoration = "none";
    button.style.fontWeight = "bold";

    document.getElementById("generatedVideo")?.after(button);
  }

  button.href = videoUrl;
  button.target = "_blank";
  button.download = "ai-video.mp4";
}


if (generateButton) {
  generateButton.addEventListener("click", generateVideo);
    }
