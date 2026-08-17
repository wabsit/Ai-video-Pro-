const promptInput = document.getElementById("prompt");
const imageInput = document.getElementById("imageInput");
const modelSelect = document.getElementById("model");
const durationSelect = document.getElementById("duration");
const ratioSelect = document.getElementById("ratio");
const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("पहले अपने वीडियो का Prompt लिखें।");
    promptInput.focus();
    return;
  }

  const duration = durationSelect.value;
  const model = modelSelect.value;
  const ratio = ratioSelect.value;

  generateBtn.disabled = true;
  generateBtn.textContent = "⏳ Preparing Video...";

  preview.innerHTML = `
    <div class="preview-message">
      <div class="play-icon">🎬</div>
      <p>आपका ${duration} मिनट का वीडियो तैयार किया जा रहा है...</p>
      <small>Scenes और video plan बनाया जा रहा है।</small>
    </div>
  `;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        model: model,
        duration: duration,
        ratio: ratio
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    preview.innerHTML = `
      <div class="preview-message">
        <div class="play-icon">✅</div>
        <p>Video Plan Ready!</p>
        <small>
          Duration: ${duration} Minutes<br>
          Model: ${model}<br>
          Format: ${ratio}
        </small>
      </div>
    `;

  } catch (error) {
    console.error("Generation Error:", error);

    preview.innerHTML = `
      <div class="preview-message">
        <div class="play-icon">❌</div>
        <p>Video generation में समस्या आई।</p>
        <small>${error.message}</small>
      </div>
    `;
  }

  generateBtn.disabled = false;
  generateBtn.textContent = "🚀 Generate Video";
});


imageInput.addEventListener("change", () => {
  if (imageInput.files.length > 0) {
    const fileName = imageInput.files[0].name;

    preview.innerHTML = `
      <div class="preview-message">
        <div class="play-icon">🖼️</div>
        <p>Reference Image Selected</p>
        <small>${fileName}</small>
      </div>
    `;
  }
});
  
