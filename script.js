// Elementos del DOM
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const confirmBtn = document.getElementById('confirm-btn');
const restartBtn = document.getElementById('restart-btn');
const previewImg = document.getElementById('preview-img');
const resultDigit = document.getElementById('result-digit');

// Pantallas
const captureScreen = document.getElementById('capture-screen');
const confirmScreen = document.getElementById('confirm-screen');
const loadingScreen = document.getElementById('loading-screen');
const resultScreen = document.getElementById('result-screen');

// URL del servidor que procesará la imagen (reemplazar con tu URL real)
const SERVER_URL = 'https://tu-servidor.com/predict';

// Variables para almacenar datos
let capturedImage = null;
let stream = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', init);

function init() {
    initCamera();
    setupEventListeners();
}

// Configurar la cámara
async function initCamera() {
    try {
        // Intentar usar la cámara trasera primero
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 1280 },
                aspectRatio: { ideal: 1 }
            }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        alert('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
}

// Configurar eventos
function setupEventListeners() {
    captureBtn.addEventListener('click', captureImage);
    retakeBtn.addEventListener('click', showCaptureScreen);
    confirmBtn.addEventListener('click', sendImageToServer);
    restartBtn.addEventListener('click', showCaptureScreen);
}

// Capturar imagen de la cámara
function captureImage() {
    // Crear un canvas del tamaño del video
    const canvas = document.createElement('canvas');
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Asegurar que el canvas sea cuadrado
    const size = Math.min(videoWidth, videoHeight);
    canvas.width = size;
    canvas.height = size;
    
    // Calcular el recorte centrado
    const xOffset = (videoWidth - size) / 2;
    const yOffset = (videoHeight - size) / 2;
    
    // Dibujar el frame actual del video en el canvas (centrado)
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, xOffset, yOffset, size, size, 0, 0, size, size);
    
    // Guardar la imagen capturada
    capturedImage = canvas.toDataURL('image/png');
    previewImg.src = capturedImage;
    
    // Mostrar pantalla de confirmación
    showConfirmScreen();
}

// Mostrar pantalla de captura
function showCaptureScreen() {
    hideAllScreens();
    captureScreen.classList.remove('hidden');
    
    // Reiniciar la cámara si es necesario
    if (!video.srcObject) {
        initCamera();
    }
}

// Mostrar pantalla de confirmación
function showConfirmScreen() {
    hideAllScreens();
    confirmScreen.classList.remove('hidden');
}

// Mostrar pantalla de carga
function showLoadingScreen() {
    hideAllScreens();
    loadingScreen.classList.remove('hidden');
}

// Mostrar pantalla de resultado
function showResultScreen() {
    hideAllScreens();
    resultScreen.classList.remove('hidden');
    
    // Detener la cámara para ahorrar recursos
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        stream = null;
    }
}

// Ocultar todas las pantallas
function hideAllScreens() {
    captureScreen.classList.add('hidden');
    confirmScreen.classList.add('hidden');
    loadingScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
}

// Enviar imagen al servidor
async function sendImageToServer() {
    showLoadingScreen();
    
    try {
        // Crear objeto con los datos a enviar
        const data = {
            image: capturedImage
        };
        
        // Enviar la imagen al servidor
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        // Procesar respuesta
        const result = await response.json();
        
        // Mostrar resultado
        resultDigit.textContent = result.digit;
        showResultScreen();
        
    } catch (error) {
        console.error('Error al enviar la imagen:', error);
        alert('Ocurrió un error al procesar la imagen. Inténtalo de nuevo.');
        showCaptureScreen();
    }
}
