# 🎨 SVGRA - Native SVG Editor

**SVGRA** is a lightweight, browser-based SVG editor that works entirely offline using native browser APIs. No dependencies, no frameworks—just pure JavaScript and the browser's built-in SVG capabilities.

<div align="center">
  <img src="assets/logo.svg" alt="logo" width="400">
</div>  


## ✨ Features

### 🎯 **Core Functionality**
- **Native SVG Editing**: Uses browser's built-in SVG DOM API (no external libraries)
- **Live Preview**: Real-time rendering as you type
- **ViewBox Visualization**: Visual overlay showing viewBox boundaries
- **Mobile-First Design**: Perfect vertical split layout for mobile and desktop

### 💾 **Export & Save**
- Save as `.svg` file
- Export as `.png` image
- Copy SVG code to clipboard
- Create shareable URLs
- Load example templates

### 📱 **UX Features**
- Three-dots floating menu for all actions
- Touch-optimized interface
- Dark/light mode support
- Syntax highlighting for SVG/XML
- Element selection in preview

## 🚀 Quick Start

1. **Open the editor**: Visit [https://yus.github.io/svgra/](https://yus.github.io/svgra/)
2. **Start editing**: Modify the SVG code in the left panel
3. **Watch live preview**: See changes instantly in the right panel
4. **Use the menu**: Click the `⋮` button for save/export options

**No installation needed** - works directly in any modern browser!

## 🖥️ Local Development

Clone and run locally:

```bash
# Clone the repository
git clone https://github.com/yus/svgra.git

# Open index.html in your browser
open index.html

# Or use a local server
python3 -m http.server 8000
```

🎨 How It Works

SVGRA uses the browser's native capabilities:

· DOMParser - Parses SVG/XML strings into DOM elements
· XMLSerializer - Converts DOM back to SVG strings
· Canvas API - For PNG export functionality
· Native SVG DOM - For all rendering and manipulation

📱 Mobile Usage

The editor features a perfect vertical split layout on mobile:

· Top half: Code editor with syntax highlighting
· Bottom half: Live preview with touch interactions
· Floating menu: Easy access to all actions

🛠️ Technical Stack

· Pure Vanilla JavaScript (no frameworks)
· Native SVG DOM API (no SVG libraries)
· CSS Grid/Flexbox for responsive layout
· Service Worker for offline capability (optional)
· Web Share API for native sharing

🌈 Example SVG Code

```svg
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="300" height="200" rx="20" 
        fill="white" stroke="#4f46e5" stroke-width="3"/>
  <circle cx="200" cy="150" r="80" fill="#ef4444" opacity="0.8"/>
  <text x="200" y="260" text-anchor="middle" font-family="Arial" 
        font-size="18" fill="#374151">SVGRA Editor</text>
</svg>
```

🔧 Browser Support

· ✅ Chrome 60+
· ✅ Firefox 55+
· ✅ Safari 12+
· ✅ Edge 79+
· ✅ iOS Safari 12+
· ✅ Chrome for Android

📄 License

MIT License - see LICENSE file for details.

🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

📞 Support

· Issues: GitHub Issues
· Discussions: GitHub Discussions

🌟 Why SVGRA?

Unlike other SVG editors that rely on heavy frameworks or libraries, SVGRA demonstrates what's possible using only native browser APIs. It's:

· Lightweight: Zero dependencies, fast loading
· Educational: Great for learning SVG and browser APIs
· Practical: Useful for quick SVG editing and prototyping
· Portable: Single HTML file that works anywhere

---

<div align="center">

Made with ❤️ by yus

Try it now: https://yus.github.io/svgra/

</div>
