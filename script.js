// Elementos DOM
const videoEl = document.getElementById('video');
const canvasOverlay = document.getElementById('canvas-overlay');
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const previewImg = document.getElementById('preview-img');
const processedCanvas = document.getElementById('processed-canvas');
const displayCanvas = document.getElementById('display-canvas');
const predictionResult = document.getElementById('prediction-result');
const confidenceContainer = document.getElementById('confidence-container');
const loadingEl = document.getElementById('loading');

// Botones y secciones
const cameraBtnTab = document.getElementById('camera-tab');
const uploadBtnTab = document.getElementById('upload-tab');
const cameraContent = document.getElementById('camera-content');
const uploadContent = document.getElementById('upload-content');
const captureBtn = document.getElementById('capture-btn');
const flipCameraBtn = document.getElementById('flip-camera');
const processBtn = document.getElementById('process-btn');
const backBtn = document.getElementById('back-btn');
const previewSection = document.getElementById('preview-section');

// Variables para la cámara
let stream;
let currentFacingMode = 'environment'; // 'environment' para cámara trasera, 'user' para frontal

// URL del API donde enviaremos la imagen para procesar (reemplazar con tu API real)
const API_URL = 'https://tu-api-para-procesamiento.com/predict';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initCamera();
    setupEventListeners();
});

// Iniciar acceso a la cámara
async function initCamera() {
    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoEl.srcObject = stream;
    } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        alert('No se pudo acceder a la cámara. Verifica los permisos o utiliza la opción de subir imagen.');
    }
}

// Configurar todos los escuchadores de eventos
function setupEventListeners() {
    // Tabs
    cameraBtnTab.addEventListener('click', () => switchTab('camera'));
    uploadBtnTab.addEventListener('click', () => switchTab('upload'));
    
    // Cámara
    captureBtn.addEventListener('click', captureImage);
    flipCameraBtn.addEventListener('click', toggleCamera);
    
    // Subida de archivos
    fileInput.addEventListener('change', handleFileSelect);
    dropArea.addEventListener('dragover', e => {
        e.preventDefault();
        dropArea.classList.add('active');
    });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('active'));
    dropArea.addEventListener('drop', handleFileDrop);
    dropArea.addEventListener('click', () => fileInput.click());
    
    // Botones de procesamiento
    processBtn.addEventListener('click', processImage);
    backBtn.addEventListener('click', resetToCapture);
}

// Cambiar entre pestañas
function switchTab(tab) {
    if (tab === 'camera') {
        cameraBtnTab.classList.add('active');
        uploadBtnTab.classList.remove('active');
        cameraContent.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        
        // Reiniciar la cámara si es necesario
        if (!videoEl.srcObject) {
            initCamera();
        }
    } else {
        cameraBtnTab.classList.remove('active');
        uploadBtnTab.classList.add('active');
        cameraContent.classList.add('hidden');
        uploadContent.classList.remove('hidden');
        
        // Detener la cámara para ahorrar recursos
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoEl.srcObject = null;
        }
    }
}

// Capturar imagen de la cámara
function captureImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Crear un canvas del tamaño del video
    const videoWidth = videoEl.videoWidth;
    const videoHeight = videoEl.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Dibujar el frame actual del video en el canvas
    ctx.drawImage(videoEl, 0, 0, videoWidth, videoHeight);
    
    // Calcular el recorte centrado (la región marcada por el cuadro de captura)
    const size = Math.min(videoWidth, videoHeight) * 0.6;
    const x = (videoWidth - size) / 2;
    const y = (videoHeight - size) / 2;
    
    // Recortar la imagen
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = size;
    croppedCanvas.height = size;
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(canvas, x, y, size, size, 0, 0, size, size);
    
    // Mostrar la imagen recortada en la vista previa
    const imageDataUrl = croppedCanvas.toDataURL('image/png');
    previewImg.src = imageDataUrl;
    
    // Cambiar a la vista de previsualización
    showPreviewSection();
}

// Cambiar entre cámaras (frontal/trasera)
async function toggleCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        videoEl.srcObject = stream;
    } catch (err) {
        console.error('Error al cambiar la cámara:', err);
        alert('No se pudo cambiar la cámara.');
    }
}

// Manejar selección de archivo desde el input
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            showPreviewSection();
        };
        reader.readAsDataURL(file);
    }
}

// Manejar archivos arrastrados y soltados
function handleFileDrop(e) {
    e.preventDefault();
    dropArea.classList.remove('active');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            showPreviewSection();
        };
        reader.readAsDataURL(file);
    }
}

// Mostrar la sección de previsualización
function showPreviewSection() {
    cameraContent.classList.add('hidden');
    uploadContent.classList.add('hidden');
    previewSection.classList.remove('hidden');
}

// Volver a la captura o subida
function resetToCapture() {
    previewSection.classList.add('hidden');
    
    // Volver a la pestaña que estaba activa
    if (cameraBtnTab.classList.contains('active')) {
        cameraContent.classList.remove('hidden');
        if (!videoEl.srcObject) {
            initCamera();
        }
    } else {
        uploadContent.classList.remove('hidden');
    }
    
    // Limpiar resultados
    predictionResult.textContent = '-';
    confidenceContainer.innerHTML = '';
}

// Procesar la imagen
async function processImage() {
    try {
        showLoading(true);
        
        // Procesar la imagen a 28x28 píxeles en escala de grises
        await preprocessImage();
        
        // En una aplicación real, aquí enviaríamos la imagen al servidor
        // Para esta demo, simularemos una predicción
        const predictions = await simulatePrediction();
        
        // Mostrar resultados
        displayResults(predictions);
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        alert('Ocurrió un error al procesar la imagen.');
    } finally {
        showLoading(false);
    }
}

// Preprocesamiento de imagen
async function preprocessImage() {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // Redimensionar a 28x28 píxeles
            const ctx = processedCanvas.getContext('2d');
            
            // Limpiar el canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 28, 28);
            
            // Dibujar en escala de grises
            ctx.drawImage(img, 0, 0, 28, 28);
            
            // Convertir a escala de grises y umbralizar
            const imageData = ctx.getImageData(0, 0, 28, 28);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                // Convertir a escala de grises
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                
                // Invertir y umbralizar (para que el dígito sea blanco sobre fondo negro)
                const threshold = 200; // Ajustar según sea necesario
                const value = gray < threshold ? 255 : 0;
                
                // Establecer el valor en todos los canales
                data[i] = data[i + 1] = data[i + 2] = value;
                data[i + 3] = 255; // Alpha
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Mostrar versión ampliada para visualización
            const displayCtx = displayCanvas.getContext('2d');
            displayCtx.imageSmoothingEnabled = false; // Desactivar suavizado para ver píxeles
            displayCtx.clearRect(0, 0, 140, 140);
            displayCtx.drawImage(processedCanvas, 0, 0, 28, 28, 0, 0, 140, 140);
            
            resolve();
        };
        img.src = previewImg.src;
    });
}

// Simular predicción (en una aplicación real, esto se haría en el servidor)
async function simulatePrediction() {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En una aplicación real, enviaríamos la imagen al servidor con algo como:
    /*
    const processedImageData = processedCanvas.toDataURL('image/png');
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: processedImageData })
    });
    return await response.json();
    */
    
    // Para esta demo, devolvemos resultados aleatorios
    const randomPrediction = Math.floor(Math.random() * 10);
    const results = Array(10).fill(0).map((_, i) => {
        return i === randomPrediction ? Math.random() * 0.5 + 0.5 : Math.random() * 0.2;
    });
    
    // Normalizar para que sumen 1
    const sum = results.reduce((a, b) => a + b, 0);
    const normalized = results.map(val => val / sum);
    
    return normalized.map((confidence, digit) => ({
        digit,
        confidence
    })).sort((a, b) => b.confidence - a.confidence);
}

// Mostrar resultados de predicción
function displayResults(predictions) {
    // Mostrar el dígito con mayor confianza
    const topPrediction = predictions[0];
    predictionResult.textContent = topPrediction.digit;
    
    // Limpiar contenedor de confianza
    confidenceContainer.innerHTML = '';
    
    // Mostrar barras de confianza para cada dígito
    predictions.forEach(pred => {
        const bar = document.createElement('div');
        bar.className = 'confidence-bar';
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = pred.digit;
        
        const barBg = document.createElement('div');
        barBg.className = 'bar-bg';
        
        const barFill = document.createElement('div');
        barFill.className = 'bar-fill';
        barFill.style.width = `${pred.confidence * 100}%`;
        
        const value = document.createElement('div');
        value.className = 'bar-value';
        value.textContent = `${(pred.confidence * 100).toFixed(1)}%`;
        
        barBg.appendChild(barFill);
        bar.appendChild(label);
        bar.appendChild(barBg);
        bar.appendChild(value);
        confidenceContainer.appendChild(bar);
    });
}

// Mostrar/ocultar indicador de carga
function showLoading(show) {
    if (show) {
        loadingEl.classList.remove('hidden');
    } else {
        loadingEl.classList.add('hidden');
    }
}
