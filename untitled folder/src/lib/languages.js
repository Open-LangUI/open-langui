export const languages = [
  { name: "Auto", code: "auto", romanize: false, prompt: "" },
  { name: "English", code: "en", romanize: false, prompt: "Return phonetic sounds in KK system." },
  { name: "Chinese (Simplified)", code: "zh-CN", romanize: true, prompt: "Return romanization in pinyin." },
  { name: "Chinese (Traditional)", code: "zh-TW", romanize: true, prompt: "Return romanization in pinyin." },
  { name: "Japanese", code: "ja", romanize: true, prompt: "Return romanization in romaji." },
  { name: "Spanish", code: "es", romanize: false, prompt: "" },
  { name: "French", code: "fr", romanize: false, prompt: "" }
];

export const defaultSource = "auto";
export const defaultTarget = "zh-CN";