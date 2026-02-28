// app.js

const App = {
    isProcessing: false,
    isGridVisible: false,
    isViewBoxVisible: false,
    currentTheme: 'light',

    async init() {
        // Initialize components
        Editor.init();
        Preview.init();
        Tools.init();
        Settings.render();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load example
        Editor.loadExample();
        
        // Load settings
        this.loadSettings();
        
        // Initialize Lucide icons
        if (window.lucide) lucide.createIcons();
        
        // Setup layout system
        this.setupLayout();
    },

    setupEventListeners() {
        // Header controls
        document.getElementById('loadExampleBtn').addEventListener('click', () => Editor.loadExample());
        document.getElementById('updatePreviewBtn').addEventListener('click', () => this.updatePreview());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveSVG());
        document.getElementById('settingsBtn').addEventListener('click', () => Settings.open());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => Settings.close());

        // Editor tool buttons
        document.getElementById('formatBtn')?.addEventListener('click', () => Editor.format());
        document.getElementById('minifyBtn')?.addEventListener('click', () => Editor.minify());
        document.getElementById('copyBtn')?.addEventListener('click', () => Editor.copy());
        document.getElementById('clearBtn')?.addEventListener('click', () => Editor.clear());
        document.getElementById('undoBtn')?.addEventListener('click', () => Editor.undo());
        document.getElementById('redoBtn')?.addEventListener('click', () => Editor.redo());

        // Preview tool buttons
        document.getElementById('zoomInBtn')?.addEventListener('click', () => Preview.zoomIn());
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => Preview.zoomOut());
        document.getElementById('resetZoomBtn')?.addEventListener('click', () => Preview.resetZoom());
        document.getElementById('toggleGridBtn')?.addEventListener('click', () => this.toggleGrid());
        document.getElementById('toggleViewBoxBtn')?.addEventListener('click', () => this.toggleViewBox());
        document.getElementById('fitToScreenBtn')?.addEventListener('click', () => Preview.fitToScreen());
        document.getElementById('centerViewBtn')?.addEventListener('click', () => Preview.centerView());

        // Settings changes
        document.getElementById('fontSize')?.addEventListener('change', (e) => this.updateFontSize(e.target.value));
        document.getElementById('tabSize')?.addEventListener('change', (e) => this.updateTabSize(e.target.value));
        document.getElementById('showGrid')?.addEventListener('change', (e) => this.toggleGridSetting(e.target.checked));
        document.getElementById('gridSize')?.addEventListener('change', (e) => this.updateGridSize(e.target.value));
        document.getElementById('showViewBox')?.addEventListener('change', (e) => this.toggleViewBoxSetting(e.target.checked));
        document.getElementById('defaultZoom')?.addEventListener('change', (e) => {
            Preview.zoomLevel = parseInt(e.target.value);
            Preview.applyZoom();
        });
    },

    setupLayout() {
        const checkLayout = () => {
            const width = window.innerWidth;
            const mainContent = document.getElementById('mainContent');
            
            if (width < 768) {
                mainContent.style.gridTemplateColumns = '1fr';
                mainContent.style.gridTemplateRows = '1fr 1fr';
            } else {
                mainContent.style.gridTemplateColumns = '1fr 1fr';
                mainContent.style.gridTemplateRows = '1fr';
            }
        };
        
        checkLayout();
        window.addEventListener('resize', checkLayout);
    },

    updatePreview() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        Preview.update(Editor.getValue());
        
        setTimeout(() => {
            this.isProcessing = false;
        }, 100);
    },

    updateCounters() {
        const editor = Editor.element;
        const charCount = document.getElementById('charCount');
        const lineCount = document.getElementById('lineCount');
        
        charCount.innerHTML = `
            <i data-lucide="text" class="icon-sm"></i>
            <span>${editor.value.length} chars</span>
        `;
        
        lineCount.innerHTML = `
            <i data-lucide="edit-3" class="icon-sm"></i>
            <span>Lines: ${editor.value.split('\n').length}</span>
        `;
        
        if (window.lucide) lucide.createIcons();
    },

    updateCursorPosition() {
        const editor = Editor.element;
        const pos = editor.selectionStart;
        const text = editor.value.substring(0, pos);
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        const cursorPos = document.getElementById('cursorPosition');
        if (cursorPos) {
            cursorPos.innerHTML = `
                <i data-lucide="pencil" class="icon-sm"></i>
                <span>Ln ${line}, Col ${col}</span>
            `;
        }
        
        if (window.lucide) lucide.createIcons();
    },

    updateElementCount(count) {
        const elementCount = document.getElementById('elementCount');
        elementCount.innerHTML = `
            <i data-lucide="layers" class="icon-sm"></i>
            <span>Elements: ${count}</span>
        `;
        if (window.lucide) lucide.createIcons();
    },

    updateObjectInfo(id) {
        const selectedObject = document.getElementById('selectedObject');
        const objectPosition = document.getElementById('objectPosition');
        const objectSize = document.getElementById('objectSize');
        
        if (id && Preview.elementData[id]) {
            const data = Preview.elementData[id];
            selectedObject.textContent = `${data.tag} #${id}`;
            objectPosition.textContent = `x: ${Math.round(data.position.x)}, y: ${Math.round(data.position.y)}`;
            objectSize.textContent = `${Math.round(data.size.width)}×${Math.round(data.size.height)}`;
        } else {
            selectedObject.textContent = 'No selection';
            objectPosition.textContent = '';
            objectSize.textContent = '';
        }
    },

    // Grid functions
    toggleGrid() {
        this.isGridVisible = !this.isGridVisible;
        document.getElementById('gridOverlay').classList.toggle('active', this.isGridVisible);
        document.getElementById('toggleGridBtn').classList.toggle('active', this.isGridVisible);
        Toast.info(this.isGridVisible ? 'Grid enabled' : 'Grid disabled');
    },

    toggleGridSetting(visible) {
        this.isGridVisible = visible;
        document.getElementById('gridOverlay').classList.toggle('active', visible);
        document.getElementById('showGrid').checked = visible;
    },

    updateGrid() {
        const gridSize = parseInt(localStorage.getItem('svgEditor_gridSize') || '20');
        const gridOverlay = document.getElementById('gridOverlay');
        gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
    },

    updateGridSize(size) {
        localStorage.setItem('svgEditor_gridSize', size);
        this.updateGrid();
        Toast.success(`Grid size set to ${size}px`);
    },

    // ViewBox functions
    toggleViewBox() {
        this.isViewBoxVisible = !this.isViewBoxVisible;
        document.getElementById('viewboxIndicator').classList.toggle('active', this.isViewBoxVisible);
        document.getElementById('toggleViewBoxBtn').classList.toggle('active', this.isViewBoxVisible);
    },

    toggleViewBoxSetting(visible) {
        this.isViewBoxVisible = visible;
        document.getElementById('viewboxIndicator').classList.toggle('active', visible);
        document.getElementById('showViewBox').checked = visible;
    },

    updateViewBox() {
        const svgElement = document.getElementById('preview').firstChild;
        const indicator = document.getElementById('viewboxIndicator');
        
        if (svgElement && svgElement.tagName === 'svg') {
            const viewBox = Utils.getViewBox(svgElement);
            if (viewBox) {
                const containerRect = document.querySelector('.preview-container').getBoundingClientRect();
                
                const scale = Math.min(
                    (containerRect.width - 40) / viewBox.width,
                    (containerRect.height - 40) / viewBox.height
                ) * (Preview.zoomLevel / 100);
                
                indicator.style.left = '50%';
                indicator.style.top = '50%';
                indicator.style.width = (viewBox.width * scale) + 'px';
                indicator.style.height = (viewBox.height * scale) + 'px';
                indicator.style.marginLeft = (-viewBox.width * scale / 2) + 'px';
                indicator.style.marginTop = (-viewBox.height * scale / 2) + 'px';
            }
        }
    },

    // Settings functions
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = theme + '-theme';
        localStorage.setItem('svgEditor_theme', theme);
        
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.theme === theme);
        });
        
        if (window.lucide) lucide.createIcons();
        Toast.success(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`);
    },

    updateFontSize(size) {
        Editor.element.style.fontSize = size + 'px';
        localStorage.setItem('svgEditor_fontSize', size);
        Toast.info(`Font size set to ${size}px`);
    },

    updateTabSize(size) {
        localStorage.setItem('svgEditor_tabSize', size);
        localStorage.setItem('svgEditor_tabType', size === 'tab' ? 'tab' : 'spaces');
        Toast.info('Tab size updated');
    },

    loadSettings() {
        Settings.load();
        
        // Apply settings
        const theme = localStorage.getItem('svgEditor_theme') || 'light';
        this.setTheme(theme);
        
        const fontSize = localStorage.getItem('svgEditor_fontSize') || '13';
        this.updateFontSize(fontSize);
        
        const showGrid = localStorage.getItem('svgEditor_showGrid') === 'true';
        this.toggleGridSetting(showGrid);
        
        const gridSize = localStorage.getItem('svgEditor_gridSize') || '20';
        this.updateGridSize(gridSize);
        
        const showViewBox = localStorage.getItem('svgEditor_showViewBox') === 'true';
        this.toggleViewBoxSetting(showViewBox);
        
        const defaultZoom = localStorage.getItem('svgEditor_defaultZoom') || '100';
        Preview.zoomLevel = parseInt(defaultZoom);
        Preview.applyZoom();
    },

    saveSVG() {
        const svgContent = Editor.getValue();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('SVG saved');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
