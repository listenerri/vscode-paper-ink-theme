# Paper & Ink

一对极简的 VS Code 配色主题，取自 [webwithoutjs.com/lab/paper-ink](https://webwithoutjs.com/lab/paper-ink/) 的纸墨配色：

- **Paper**（浅色）—— 暖米白纸面 + 墨色文字 + 铁锈橙点缀
- **Ink**（深色）—— 整个页面倒过来：暖炭黑"墨"底 + 纸色文字 + 陶土橙点缀

## 配色

直接取自该站 CSS 的 `light-dark()` token（OKLCH → sRGB），共 7 个网站原有 token，
另为语法高亮派生了 4 个同色域的辅助色（低彩度 moss / slate / ochre / brick）：

| Token | Paper（浅） | Ink（深） | 用途 |
|---|---|---|---|
| paper | `#f5f0e0` | `#241b14` | 纸面 / 背景 |
| ink | `#30231b` | `#ece8d9` | 墨色 / 前景 |
| oxide | `#aa3606` | `#de7949` | 锈橙点缀（链接、选中、活动边框） |
| muted | `#635147` | `#b0a290` | 弱化文字（行号、面包屑、注释） |
| fill | `#ebe4d2` | `#312620` | 面板、终端、建议框底 |
| hover | `#e1d8c3` | `#41332a` | 列表 / 页签悬停（比 fill 更深/浅一档，派生） |
| deep | — | `#0b0401` | 深色状态栏底（对应浅色的墨色状态栏） |
| rule | `#30231b40` | `#ece8d940` | 分隔线（前景色 25% 透明度） |
| moss | `#3e7050` | `#75b68c` | 字符串（派生） |
| slate | `#4d6291` | `#8faae4` | 函数 / 类型（派生） |
| ochre | `#8f6f23` | `#d1ac5a` | 常量 / 属性 / 数字（派生） |
| brick | `#c13c3b` | `#ed756e` | 错误（派生） |

设计上保留网站的几个特征：

- 浅色主题的状态栏是一条**墨色横条**（对应网站里 `.skip`/按钮的墨底纸字）
- 选区高亮、活动页签上边线、焦点边框都用 oxide 锈橙
- 终端 / 代码块用 `fill` 底色，模拟网站里 `<pre>` 的"纸衬纸"效果
- 注释为 muted 色 + 斜体

## 使用

### 方式一：开发宿主预览（F5）

用 VS Code 打开本目录，按 <kbd>F5</kbd> 启动扩展开发宿主，
在新窗口里 <kbd>Ctrl</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>+<kbd>T</kbd> 选择 **Paper** 或 **Ink**。

### 方式二：打包安装

```bash
npx @vscode/vsce package          # 生成 paper-ink-0.1.0.vsix
code --install-extension paper-ink-0.1.0.vsix
```

## 重新生成主题

所有颜色集中在 `scripts/generate-theme.mjs` 顶部的 OKLCH 定义里，改完重跑即可：

```bash
node scripts/generate-theme.mjs
```

## License

MIT
