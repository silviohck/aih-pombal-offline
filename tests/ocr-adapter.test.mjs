import test from "node:test";
import assert from "node:assert/strict";
import { converterResultadoPaddle } from "../paddle-adapter.js";

test("converte linhas do PaddleOCR em palavras com caixas e percentual de confiança", () => {
  const data = converterResultadoPaddle({
    items: [{
      text: "MARIA SILVA",
      score: 0.93,
      poly: [[10, 20], [210, 20], [210, 40], [10, 40]]
    }]
  });
  assert.equal(data.text, "MARIA SILVA");
  assert.deepEqual(data.words.map(w => w.text), ["MARIA", "SILVA"]);
  assert.equal(data.words[0].confidence, 93);
  assert.equal(data.words[0].bbox.y0, 20);
  assert.equal(data.words[1].bbox.y1, 40);
  assert.ok(data.words[0].bbox.x1 < data.words[1].bbox.x0);
});

test("não cria palavras quando não há texto ou polígono válido", () => {
  const data = converterResultadoPaddle({
    items: [
      { text: "", score: 0.8, poly: [[0, 0], [1, 1]] },
      { text: "SEM CAIXA", score: 0.9, poly: [] },
      { text: "RUIM", score: 0.9, poly: [[0, 0], [0, 10]] }
    ]
  });
  assert.equal(data.text, "SEM CAIXA\nRUIM");
  assert.equal(data.words.length, 0);
});

test("mantém acentos, números e limita a confiança a 0-100", () => {
  const data = converterResultadoPaddle({
    items: [{ text: "JOÃO 123.456", score: 120, poly: [[0,0],[120,0],[120,18],[0,18]] }]
  });
  assert.equal(data.words[0].text, "JOÃO");
  assert.equal(data.words[1].text, "123.456");
  assert.equal(data.words[0].confidence, 100);
});
