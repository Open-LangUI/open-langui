# LM Studio Translator 🌐

A simple, self-hosted web app built with **Svelte + TailwindCSS** that connects to **LM Studio’s API** to translate text between multiple languages.  

![Demo GIF](/demo.gif)

## ✨ Features
- 🔄 Translate text between different languages using LM Studio models  
- 🧩 Switch source/target languages quickly  
- ⚙️ Customizable preferences (base URL, API key, model, temperature)  
- 📋 Save your favorite models and languages  

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
- **Base URL** (default: `http://localhost:1234`) For best results, use the IP assigned to your server.
- **API Key** (optional)
- **Temperature** (controls randomness, default `0.2`)

## 📜 License
MIT License – feel free to use and modify.
Copyright (c) 2025 Lou Cappy
