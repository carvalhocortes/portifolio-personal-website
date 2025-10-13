//const density = "Ñ@#W$9876543210?!abc;:+=-,._         ";
const density = '   .:-i|=+%O#@'

let video;

function preload() {
	video = createVideo(['video.mp4']);
}

function setup() {
    noCanvas();
    //video = createCapture(VIDEO);
    video.size(60, 50);
  	video.volume(0);
	video.loop();
}

function draw() {
  video.loadPixels();
	
  const txtElement = document.querySelector('.asciiVideo');
	
  let asciiImage = "";
  for (let j = 0; j < video.height; j++) {
    for (let i = 0; i < video.width; i++) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      const len = density.length;
      const charIndex = floor(map(avg, 255, 0, 0, len));
      const c = density.charAt(charIndex);
      if (c == " ") asciiImage += "&nbsp;";
      else asciiImage += c;
    }
    asciiImage += '<br/>';
  }
  txtElement.innerHTML = asciiImage;
}