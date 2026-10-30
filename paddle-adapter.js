// Adaptador opcional do PaddleOCR.js para o formato de leitura da AIH.
// O módulo do SDK e os modelos são carregados somente ao escolher PaddleOCR.
// Nenhuma foto é transmitida pelo aplicativo para o CDN: somente código e modelos são baixados.
const SDK_URL = "https://cdn.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm";
const WASM_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/";
let motor = null;
let inicializacao = null;

/**
 * O PaddleOCR retorna caixas por linha, enquanto o leitor da AIH usa palavras.
 * Aproximamos as posições de cada palavra pela fração de caracteres na linha;
 * por isso os campos extraídos continuam exigindo conferência visual.
 */
export function converterResultadoPaddle(resultado) {
  const linhas = Array.isArray(resultado?.items) ? resultado.items : [];
  const words = [];
  const textos = [];
  for (const linha of linhas) {
    const text = String(linha?.text || "").trim();
    if (!text) continue;
    textos.push(text);
    const pontos = Array.isArray(linha?.poly) ? linha.poly : [];
    const coords = pontos
      .filter(p => Array.isArray(p) && p.length >= 2)
      .map(p => [Number(p[0]), Number(p[1])])
      .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (!coords.length) continue;
    const x0 = Math.min(...coords.map(p => p[0]));
    const y0 = Math.min(...coords.map(p => p[1]));
    const x1 = Math.max(...coords.map(p => p[0]));
    const y1 = Math.max(...coords.map(p => p[1]));
    if (x1 <= x0 || y1 <= y0) continue;
    const rawScore = Number(linha.score);
    const confidence = Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, rawScore <= 1 ? rawScore * 100 : rawScore))
      : 0;
    for (const match of text.matchAll(/\S+/g)) {
      const start = match.index || 0;
      const end = start + match[0].length;
      words.push({
        text: match[0],
        confidence,
        bbox: {
          x0: x0 + (start / text.length) * (x1 - x0),
          y0,
          x1: x0 + (end / text.length) * (x1 - x0),
          y1
        }
      });
    }
  }
  return { text: textos.join("\n"), words };
}

async function obterMotor(status) {
  if (motor) return motor;
  if (!inicializacao) {
    inicializacao = (async () => {
      status("Baixando leitor PaddleOCR…");
      const { PaddleOCR } = await import(SDK_URL);
      status("Preparando modelos em português…");
      return PaddleOCR.create({
        lang: "pt",
        ocrVersion: "PP-OCRv6",
        ortOptions: {
          backend: "wasm",
          wasmPaths: WASM_URL,
          numThreads: 1,
          simd: true
        }
      });
    })();
  }
  try {
    motor = await inicializacao;
    return motor;
  } catch (erro) {
    inicializacao = null;
    throw erro;
  }
}

export async function reconhecerPaddle(canvas, status = () => {}) {
  const instancia = await obterMotor(status);
  status("Reconhecendo o texto com PaddleOCR…");
  const resultados = await instancia.predict(canvas);
  const data = converterResultadoPaddle(resultados?.[0]);
  if (!data.words.length) {
    throw new Error("PaddleOCR não identificou palavras; tentar leitor offline.");
  }
  return data;
}
