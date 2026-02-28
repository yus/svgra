// Editor.js

const Editor = {
    element: document.getElementById('editor'),
    history: [],
    historyIndex: -1,
    
    init() {
        if (!this.element) return;
        
        this.element.addEventListener('input', () => {
            App.updateCounters();
            if (document.getElementById('autoUpdate')?.checked) {
                App.updatePreview();
            }
            this.pushToHistory();
        });
        
        this.element.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.element.addEventListener('click', () => App.updateCursorPosition());
        this.element.addEventListener('keyup', () => App.updateCursorPosition());
        
        this.pushToHistory();
    },

    getValue() {
        return this.element ? this.element.value : '';
    },

    setValue(value) {
        if (this.element) {
            this.element.value = value;
            this.pushToHistory();
        }
    },

    handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            this.handleTab();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            App.saveSVG();
        }
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.format();
        }
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            this.minify();
        }
    },

    handleTab() {
        const tabSize = parseInt(localStorage.getItem('svgEditor_tabSize') || '4');
        const start = this.element.selectionStart;
        const end = this.element.selectionEnd;
        
        if (localStorage.getItem('svgEditor_tabType') === 'tab') {
            this.element.value = this.element.value.substring(0, start) + '\t' + 
                               this.element.value.substring(end);
            this.element.selectionStart = this.element.selectionEnd = start + 1;
        } else {
            const spaces = ' '.repeat(tabSize);
            this.element.value = this.element.value.substring(0, start) + spaces + 
                               this.element.value.substring(end);
            this.element.selectionStart = this.element.selectionEnd = start + tabSize;
        }
    },

    pushToHistory() {
        if (!this.element) return;
        const currentValue = this.element.value;
        if (this.history[this.historyIndex] !== currentValue) {
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(currentValue);
            this.historyIndex++;
            
            if (this.history.length > 50) {
                this.history.shift();
                this.historyIndex--;
            }
        }
    },

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.element.value = this.history[this.historyIndex];
            App.updatePreview();
            App.updateCounters();
            Toast.info('Undo successful');
        }
    },

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.element.value = this.history[this.historyIndex];
            App.updatePreview();
            App.updateCounters();
            Toast.info('Redo successful');
        }
    },

    // FIXED: Format function was missing!
    format() {
        try {
            const formatted = Utils.formatXML(this.element.value);
            this.element.value = formatted;
            App.updatePreview();
            App.updateCounters();
            this.pushToHistory();
            Toast.success('Code formatted');
        } catch (e) {
            Toast.error('Error formatting code: ' + e.message);
        }
    },

    // FIXED: Minify function was missing!
    minify() {
        try {
            const minified = Utils.minifyXML(this.element.value);
            this.element.value = minified;
            App.updatePreview();
            App.updateCounters();
            this.pushToHistory();
            Toast.success('Code minified');
        } catch (e) {
            Toast.error('Error minifying code: ' + e.message);
        }
    },

    copy() {
        this.element.select();
        document.execCommand('copy');
        Toast.success('Copied to clipboard');
    },

    clear() {
        if (confirm('Clear editor content?')) {
            this.element.value = '';
            App.updatePreview();
            App.updateCounters();
            this.pushToHistory();
            Toast.info('Editor cleared');
        }
    },

    loadExample() {
        this.element.value = `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect id="background" width="300" height="200" fill="#f0f0f0"/>
  <circle id="circle1" cx="80" cy="100" r="40" fill="#FF6B6B"/>
  <rect id="rectangle1" x="150" y="60" width="80" height="80" fill="#4ECDC4"/>
  <polygon id="triangle1" points="260,100 230,160 290,160" fill="#FFD166"/>
  <text id="text1" x="150" y="180" text-anchor="middle" font-family="Arial" font-size="16">SVG Elements</text>
</svg>`;
        App.updatePreview();
        App.updateCounters();
        this.pushToHistory();
        Toast.success('Example loaded');
    }
};
