# 🎬 ASCII Video Converter

Conversor de vídeo para animação ASCII que gera arrays de caracteres para uso programático.

## 📁 Arquivos Criados

### 1. **asciiVideoArray.js**

Versão com interface simples (botões) para capturar e exportar frames.

### 2. **asciiVideoArrayTest.html**

Interface HTML para testar o `asciiVideoArray.js`.

### 3. **AsciiVideoConverter.js**

Classe JavaScript para uso programático e integração com outros projetos.

### 4. **converterExample.html**

Exemplo completo de uso da classe `AsciiVideoConverter` com preview e controles.

## 🚀 Como Usar

### Opção 1: Interface Simples (Rápida)

1. Abra `asciiVideoArrayTest.html` no navegador
2. Clique em "Iniciar Captura"
3. Aguarde a captura dos frames (máximo 300)
4. O arquivo JSON será baixado automaticamente

### Opção 2: Interface Avançada (Recomendada)

1. Abra `converterExample.html` no navegador
2. Configure número de frames, largura e altura
3. Clique em "Iniciar Conversão"
4. Use os botões para:
   - 🎬 Reproduzir animação no preview
   - 💾 Exportar JSON
   - 📋 Ver dados no console do navegador

### Opção 3: Uso Programático

```javascript
// Crie uma instância do conversor
const converter = new AsciiVideoConverter("../video.mp4", 60, 50);

// Inicialize
await converter.init();

// Capture frames com callback
await converter.captureFrames(100, (frameNumber, frame) => {
  console.log(`Frame ${frameNumber} capturado`);
});

// Obtenha os dados
const allFrames = converter.getFrames(); // Todos os frames
const frame = converter.getFrame(10); // Frame específico
const data = converter.exportData(); // Objeto completo

// Use em animação
function playAnimation() {
  const frames = converter.getFrames();
  let current = 0;

  setInterval(() => {
    renderFrame(frames[current]);
    current = (current + 1) % frames.length;
  }, 1000 / 30);
}
```

## 📊 Estrutura dos Dados

### Array de Frames

```javascript
[
  [  // Frame 1
    ["c", "h", "a", "r", ...],  // Linha 1
    ["c", "h", "a", "r", ...],  // Linha 2
    ...
  ],
  [  // Frame 2
    ...
  ]
]
```

### JSON Exportado

```json
{
  "width": 60,
  "height": 50,
  "totalFrames": 300,
  "density": "   .:-i|=+%O#@",
  "frames": [...]
}
```

## 🎨 Caracteres ASCII

O conversor usa a seguinte densidade de caracteres (do mais claro ao mais escuro):

```
'   .:-i|=+%O#@'
```

Você pode modificar essa string para alterar a aparência da conversão.

## ⚙️ Configurações

### Resolução

- **Padrão**: 60x50 caracteres
- Aumentar = Mais detalhes, arquivos maiores
- Diminuir = Menos detalhes, arquivos menores

### Frames

- **Padrão**: 300 frames
- Ajuste conforme a duração desejada
- A 30 FPS = 10 segundos de animação

## 💡 Exemplos de Uso

### 1. Exportar para usar em React/Vue/Angular

```javascript
// Após converter
const data = converter.exportData();

// Use em um componente
function AsciiAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % data.totalFrames);
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <pre>{data.frames[currentFrame].map((row) => row.join("")).join("\n")}</pre>
  );
}
```

### 2. Salvar em Banco de Dados

```javascript
// Converter para string compacta
const compactData = {
  width: data.width,
  height: data.height,
  frames: data.frames.map((frame) =>
    frame.map((row) => row.join("")).join("\n")
  ),
};

// Salvar
localStorage.setItem("asciiVideo", JSON.stringify(compactData));
```

### 3. Reproduzir em Loop

```javascript
const frames = converter.getFrames();
let index = 0;

setInterval(() => {
  const ascii = frames[index].map((row) => row.join("")).join("\n");
  console.clear();
  console.log(ascii);
  index = (index + 1) % frames.length;
}, 1000 / 30);
```

## 🔧 Requisitos

- Navegador moderno com suporte a:
  - HTML5 Video
  - ES6+ JavaScript
  - p5.js (carregado via CDN)
- Arquivo `video.mp4` no diretório raiz do projeto

## 📝 Notas

1. **Performance**: Conversões com muitos frames podem demorar
2. **Tamanho**: Arquivos JSON podem ficar grandes (compacte se necessário)
3. **Navegador**: Testado em Chrome/Firefox/Edge modernos
4. **CORS**: Se rodar localmente, use um servidor local (Live Server, etc.)

## 🐛 Troubleshooting

### Vídeo não carrega

- Verifique se `video.mp4` existe
- Use servidor local (não abra direto do sistema de arquivos)
- Verifique formato do vídeo (MP4/H.264 recomendado)

### Conversão muito lenta

- Reduza número de frames
- Diminua resolução (largura/altura)
- Use navegador mais recente

### JSON muito grande

- Capture menos frames
- Reduza resolução
- Compacte os dados antes de salvar

## 📄 Licença

Código livre para uso pessoal e comercial.
