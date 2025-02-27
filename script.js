document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const captureBtn = document.getElementById('capture-btn');
  const retakeBtn = document.getElementById('retake-btn');
  const sendBtn = document.getElementById('send-btn');
  const canvas = document.getElementById('canvas');
  const predictionSpan = document.getElementById('prediction');

  const cameraSection = document.getElementById('camera-section');
  const previewSection = document.getElementById('preview-section');
  const loadingSection = document.getElementById('loading-section');
  const resultSection = document.getElementById('result-section');

  const ctx = canvas.getContext('2d');

  // Acceso a la cámara con getUserMedia
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara.");
    });

  // Capturar imagen del video
  captureBtn.addEventListener('click', () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    cameraSection.classList.add('hidden');
    previewSection.classList.remove('hidden');
  });

  // Retomar captura
  retakeBtn.addEventListener('click', () => {
    previewSection.classList.add('hidden');
    cameraSection.classList.remove('hidden');
  });

  // Enviar imagen y simular predicción
  sendBtn.addEventListener('click', () => {
    previewSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    // Simulación de llamada a API
    setTimeout(() => {
      loadingSection.classList.add('hidden');
      const randomPrediction = Math.floor(Math.random() * 10);
      predictionSpan.textContent = randomPrediction;
      resultSection.classList.remove('hidden');
    }, 2000);
  });
});
