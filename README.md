# 🌍 Algoritmos de Busca — REST Countries

Visualizador interativo de **Busca Linear** e **Busca Binária** em dados reais de países (population, área, densidade), com bandeiras visíveis e controle de velocidade.

---

## 🚀 Como rodar

### Pré-requisitos
- Python 3.9+
- Node.js 18+

---

### 1. Backend (Python/Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

O servidor estará em: **http://localhost:5000**

---

### 2. Frontend (React)

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

O site abrirá em: **http://localhost:3000**

---

## 🎮 Como usar

1. **Escolha a chave de busca**: Nome, População, Área ou Densidade
2. **Digite o termo**: nome do país (ex: `Brazil`) ou valor numérico
3. **Controle de velocidade**: arraste o slider (50ms = rápido, 2000ms = lento)
4. **Clique "Ordenar"** antes de usar a busca binária (obrigatório!)
5. **Busca Linear**: clique e observe o processo passo a passo
6. **Busca Binária**: clique e veja os marcadores LOW / MID / HIGH
7. **Gerar gráfico**: compare o crescimento de comparações por tamanho da amostra

---

## 🎨 Legenda Visual

| Cor | Significado |
|-----|-------------|
| 🟡 Amarelo | Posição MID (binária) |
| 🔵 Azul | Posição atual (linear) / LOW (binária) |
| 🟣 Roxo | LOW (binária) |
| 🩷 Rosa | HIGH (binária) |
| 🟢 Verde | ENCONTRADO! |
| ⬛ Escuro | Descartado |

---

## 📁 Estrutura

```
search-countries/
├── backend/
│   ├── app.py           # Flask API
│   └── requirements.txt
└── frontend/
    ├── src/
│   │   ├── App.js       # Componente principal
│   │   └── index.js
    └── public/
        └── index.html
```
