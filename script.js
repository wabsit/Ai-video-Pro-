const promptInput = document.getElementById("prompt");
const modelInput = document.getElementById("model");
const durationInput = document.getElementById("duration");
const ratioInput = document.getElementById("ratio");

const generateButton =
  document.getElementById("generateBtn") ||
  document.querySelector("button");

const previewBox =
  document.getElementById("videoPreview") ||
  document.querySelector("video");

const previewSection = document.querySelector(".video-preview");

async function generateVideo() {
  const prompt = promptInput?.value.trim();

  if (!prompt) {
    alert("Please describe the video first.");
    return;
  }

  if (generateButton) {
    generateButton.disabled = true;
    generateButton.innerText = "⏳ Generating Video...";
  }

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        model: modelInput?.value || "free",
        duration: durationInput?.value || "5",
        ratio: ratioInput?.value || "9:16"
      })
    });

    const data = await response.json();

    console.log("API Response:", data);

    if (!response.ok) {
      throw new Error(data.error || "Video generation failed");
    }

    const videoUrl = getVideoUrl(data.output);

    if (!videoUrl) {
      throw new Error(
        "Video generation started, but MP4 URL was not returned."
      );
    }

    showVideo(videoUrl);

  } catch (error) {
    console.error(error);

    alert("❌ " + error.message);
  } finally {
    if (generateButton) {
      generateButton.disabled = false;
      generateButton.innerText = "🚀 Generate Video";
    }
  }
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
  let video = document.getElementById("generatedVideo");

  if (!video) {
    video = document.createElement("video");

    video.id = "generatedVideo";
    video.controls = true;
    video.playsInline = true;

    video.style.width = "100%";
    video.style.maxWidth = "700px";
    video.style.borderRadius = "16px";
    video.style.marginTop = "20px";

    if (previewSection) {
      previewSection.appendChild(video);
    } else if (previewBox?.parentElement) {
      previewBox.parentElement.appendChild(video);
    } else {
      document.body.appendChild(video);
    }
  }

  video.src = videoUrl;
  video.load();

  showDownloadButton(videoUrl);

  video.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


function showDownloadButton(videoUrl) {
  let downloadButton = document.getElementById("downloadVideo");

  if (!downloadButton) {
    downloadButton = document.createElement("a");

    downloadButton.id = "downloadVideo";
    downloadButton.innerText = "⬇️ Download MP4";

    downloadButton.style.display = "inline-block";
    downloadButton.style.marginTop = "15px";
    downloadButton.style.padding = "12px 20px";
    downloadButton.style.borderRadius = "10px";
    downloadButton.style.background = "#e91e63";
    downloadButton.style.color = "#fff";
    downloadButton.style.textDecoration = "none";
    downloadButton.style.fontWeight = "bold";

    const video = document.getElementById("generatedVideo");

    if (video?.parentElement) {
      video.parentElement.appendChild(downloadButton);
    } else {
      document.body.appendChild(downloadButton);
    }
  }

  downloadButton.href = videoUrl;
  downloadButton.target = "_blank";
  downloadButton.download = "ai-video.mp4";
}


if (generateButton) {
  generateButton.addEventListener("click", generateVideo);
}
