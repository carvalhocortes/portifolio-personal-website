/**
 * ASCII Video Converter - Versão Módulo
 *
 * Esta versão permite importar e usar as funções em outro código
 */

const density = "   .:-i|=+%O#@";

class AsciiVideoConverter {
  constructor(videoPath, width = 60, height = 50) {
    this.videoPath = videoPath;
    this.width = width;
    this.height = height;
    this.framesData = [];
    this.video = null;
    this.onFrameCallback = null;
    this.onCompleteCallback = null;
  }

  // Inicializa o conversor
  init() {
    return new Promise((resolve) => {
      this.video = createVideo([this.videoPath]);
      this.video.size(this.width, this.height);
      this.video.volume(0);
      this.video.hide();
      this.video.loop();

      // Aguarda o vídeo carregar
      this.video.elt.onloadeddata = () => {
        resolve();
      };
    });
  }

  // Converte um frame para array de caracteres ASCII
  convertFrame() {
    this.video.loadPixels();

    let frameArray = [];

    for (let j = 0; j < this.video.height; j++) {
      let row = [];
      for (let i = 0; i < this.video.width; i++) {
        const pixelIndex = (i + j * this.video.width) * 4;
        const r = this.video.pixels[pixelIndex + 0];
        const g = this.video.pixels[pixelIndex + 1];
        const b = this.video.pixels[pixelIndex + 2];
        const avg = (r + g + b) / 3;
        const len = density.length;
        const charIndex = floor(map(avg, 255, 0, 0, len));
        const c = density.charAt(charIndex);
        row.push(c);
      }
      frameArray.push(row);
    }

    return frameArray;
  }

  // Captura um número específico de frames
  async captureFrames(maxFrames = 300, frameCallback = null) {
    this.framesData = [];
    this.onFrameCallback = frameCallback;

    return new Promise((resolve) => {
      let frameCount = 0;

      const captureInterval = setInterval(() => {
        const frame = this.convertFrame();
        this.framesData.push(frame);
        frameCount++;

        if (this.onFrameCallback) {
          this.onFrameCallback(frameCount, frame);
        }

        if (frameCount >= maxFrames) {
          clearInterval(captureInterval);
          resolve(this.framesData);
        }
      }, 1000 / 30); // ~30 FPS
    });
  }

  // Retorna todos os frames capturados
  getFrames() {
    return this.framesData;
  }

  // Retorna um frame específico
  getFrame(index) {
    if (index >= 0 && index < this.framesData.length) {
      return this.framesData[index];
    }
    return null;
  }

  // Exporta os dados como objeto
  exportData() {
    return {
      width: this.width,
      height: this.height,
      totalFrames: this.framesData.length,
      density: density,
      frames: this.framesData,
    };
  }

  // Converte frame array para string ASCII
  frameToString(frame) {
    return frame.map((row) => row.join("")).join("\n");
  }

  // Exibe um frame no console
  displayFrame(frame) {
    console.log(this.frameToString(frame));
  }
}

// Exemplo de uso:
/*
async function exemplo() {
    const converter = new AsciiVideoConverter('../video.mp4', 60, 50);
    await converter.init();

    // Captura 100 frames com callback
    await converter.captureFrames(100, (frameNumber, frame) => {
        console.log(`Frame ${frameNumber} capturado`);
    });

    // Obtém todos os dados
    const data = converter.exportData();
    console.log('Total de frames:', data.totalFrames);

    // Obtém um frame específico
    const firstFrame = converter.getFrame(0);
    converter.displayFrame(firstFrame);

    // Exporta como JSON
    console.log(JSON.stringify(data));
}
*/

// Exporta a classe se estiver em ambiente módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = AsciiVideoConverter;
}
