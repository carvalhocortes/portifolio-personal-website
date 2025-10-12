#!/bin/sh
':' //; exec node "$0" "$@"
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'asciiVideoData.json'); // ../asciiVideoData.json
const backupPath = filePath + '.bak';

if (!fs.existsSync(filePath)) {
  console.error('Arquivo não encontrado:', filePath);
  process.exit(1);
}

// Faz backup
fs.copyFileSync(filePath, backupPath);
console.log('Backup criado em', backupPath);

// Lê e parseia
const raw = fs.readFileSync(filePath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Erro ao parsear JSON:', err.message);
  process.exit(1);
}

if (!Array.isArray(data.frames)) {
  console.error('Formato inesperado: data.frames não é um array');
  process.exit(1);
}

// FILTRO: manter apenas frames com índice 0-based ímpar (ou seja, remover frames 1-based ímpares: 1,3,5,...)
// Se quiser remover índices 0-based ímpares ao invés disso, inverta a condição para i % 2 === 0
const filtered = data.frames.filter((_, i) => i % 2 === 1);

console.log(`Frames antes: ${data.frames.length}, depois: ${filtered.length}`);

data.frames = filtered;

// Escreve o JSON formatado de volta
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Arquivo atualizado:', filePath);
