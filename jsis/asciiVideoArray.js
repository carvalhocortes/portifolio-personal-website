const density = "   .:-i|=+%O#@";

let video;
let framesData = []; // Array para armazenar todos os frames
let isCapturing = false;
let maxFrames = 300; // Limite de frames a capturar (ajuste conforme necessário)

function preload() {
  video = createVideo(["../video.mp4"]);
}

function setup() {
  noCanvas();
  video.size(60, 50);
  video.volume(0);
  video.loop();
  video.hide(); // Esconde o vídeo da tela

  // Botão para iniciar captura
  const btnStart = createButton("Iniciar Captura");
  btnStart.mousePressed(startCapture);

  // Botão para parar e exportar
  const btnExport = createButton("Parar e Exportar JSON");
  btnExport.mousePressed(exportData);
}

function startCapture() {
  framesData = [];
  isCapturing = true;
  console.log("Captura iniciada...");
}

function draw() {
  if (!isCapturing) return;

  video.loadPixels();

  // Array para este frame específico
  let frameArray = [];

  for (let j = 0; j < video.height; j++) {
    let row = [];
    for (let i = 0; i < video.width; i++) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      const len = density.length;
      const charIndex = floor(map(avg, 255, 0, 0, len));
      const c = density.charAt(charIndex);
      row.push(c);
    }
    frameArray.push(row);
  }

  framesData.push(frameArray);

  // Mostra progresso
  console.log(`Frame ${framesData.length} capturado`);

  // Para automaticamente após capturar maxFrames
  if (framesData.length >= maxFrames) {
    isCapturing = false;
    console.log("Captura completa!");
    exportData();
  }
}

function exportData() {
  isCapturing = false;

  if (framesData.length === 0) {
    console.log("Nenhum frame capturado ainda!");
    return;
  }

  // Cria objeto com metadados
  const exportObject = {
    width: video.width,
    height: video.height,
    totalFrames: framesData.length,
    density: density,
    frames: framesData,
  };

  // Converte para JSON e faz download
  const dataStr = JSON.stringify(exportObject, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "asciiVideoData.json";
  link.click();

  console.log("Dados exportados!");
  console.log("Total de frames:", framesData.length);
  console.log("Exemplo do primeiro frame:", framesData[0]);
}

// Função para acessar os dados programaticamente
function getFramesData() {
  return framesData;
}

// Função para obter um frame específico
function getFrame(index) {
  if (index >= 0 && index < framesData.length) {
    return framesData[index];
  }
  return null;
}
