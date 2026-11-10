# 品牌图标来源

这里保存直接引用的品牌 SVG，不是手绘近似图标。页面从本地加载这些资产，不依赖图标 CDN。

- Claude、OpenAI、Codex、Gemini、Google：[@lobehub/icons-static-svg](https://github.com/lobehub/lobe-icons)，版本 `1.102.0`，MIT。上游许可保存在 `LICENSE-lobehub.txt`。
- 其余应用与服务：[@iconify-json/logos](https://github.com/iconify/icon-sets/tree/master/json)，版本 `1.2.19`，CC0-1.0；图标集来源为 [SVG Logos](https://github.com/gilbarbara/logos)。从包内 `icons.json` 的原始 SVG body 和 viewBox 生成独立文件，未重画路径。

每个文件的下载来源、上游名称和 SHA-256 均记录在 `sources.json`。单色标志通过 CSS mask 跟随当前文字颜色，彩色标志保留原始配色。品牌名称与标志归对应权利人所有。
