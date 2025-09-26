# LM Studio Translator 🌐

A simple, self-hosted web app built with **Svelte + TailwindCSS** that connects to **LM Studio’s API** to translate text between multiple languages.  

![Demo GIF](/demo.gif)

## ✨ Features
- 🔄 Translate text between different languages using LM Studio models  
- 🧩 Switch source/target languages quickly  
- ⚙️ Customizable preferences (base URL, API key, model, temperature)  
- 📋 Save your favorite models and languages  

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Open-LangUI/open-langui.git
cd open-langUI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in development mode
```bash
npm run dev
```
App will be available at: [http://localhost:5173](http://localhost:5173)

### 4. Build for production
```bash
npm run build
npm run preview
```

## 🐳 Run with Docker
You can also run the app inside Docker:

```bash
git clone https://github.com/open-langui/open-langui.git && \
cd open-langui && \
docker build -t open-langui . && \
docker run -d -p 3333:3000 --name open-langui open-langui
```

## ⚙️ Configuration
You can set these in the Preferences panel inside the app:
- **Base URL** (default: `http://localhost:1234`)
- **API Key** (optional)
- **Model** (e.g. `llama-3.1-8b-instruct`)
- **Temperature** (controls randomness, default `0.2`)

## 📜 License
MIT License – feel free to use and modify.
Copyright (c) 2025 Lou Cappy
