# AIH Pombal Offline

Aplicativo web instalável para iPhone, com OCR local e geração de laudos AIH no próprio aparelho.

As fotos e os dados inseridos pelo usuário são processados localmente no navegador e não são enviados para este repositório.


## OCR das fotografias — escolha do motor

Na seção **Fotos das AIH**, é possível escolher entre:

- **Tesseract (offline)**: leitor original, integralmente incluído neste repositório. É o modo padrão e funciona sem internet após a instalação do PWA.
- **PaddleOCR v6 (teste)**: leitor alternativo em português, executado no navegador do aparelho via WebAssembly. A seleção fica guardada neste dispositivo. A importação do SDK e o download de seus modelos exigem internet e podem falhar por bloqueio de CDN, CORS, memória ou incompatibilidade de navegador. O aplicativo então tenta automaticamente o Tesseract offline.

**Privacidade:** a fotografia é processada localmente pelo motor escolhido e não é enviada a um serviço de OCR. No modo PaddleOCR, o navegador acessa serviços externos para obter código JavaScript, runtime e arquivos de modelos (que podem registrar IP e metadados da conexão). **Não é garantido funcionamento totalmente offline no modo PaddleOCR.** Para uso sem conectividade, escolha Tesseract.

A biblioteca externa está fixada em `@paddleocr/paddleocr-js@0.4.2`, com modelos PP-OCRv6 em português e `onnxruntime-web@1.24.3`. O carregamento ocorre apenas se o usuário selecionar PaddleOCR, sem modificar a geração do PDF ou o cadastro de procedimentos.

**Importante:** as caixas do PaddleOCR representam linhas; suas coordenadas são adaptadas para as palavras do formulário de maneira aproximada. Todas as informações extraídas, sobretudo nome, CPF, CNS, data de nascimento e demais números, precisam de conferência visual. O desempenho no Safari do iPhone e a qualidade em fotos reais ainda devem ser validados antes de substituir o leitor original como padrão.

### Verificação

`node --experimental-default-type=module --test tests/ocr-adapter.test.mjs`

Os testes unitários verificam apenas a adaptação dos resultados e não validam downloads de modelos, desempenho real de OCR ou precisão em formulários fotografados.
