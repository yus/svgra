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
        // Header controls - FIXED: Now properly attached
        const loadExampleBtn = document.getElementById('loadExampleBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const updatePreviewBtn = document.getElementById('updatePreviewBtn');
        const saveBtn = document.getElementById('saveBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');

        if (loadExampleBtn) {
            loadExampleBtn.addEventListener('click', () => Editor.loadExample());
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadSVG());
        }

        if (updatePreviewBtn) {
            updatePreviewBtn.addEventListener('click', () => this.updatePreview());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSVG());
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => Settings.open());
        }

        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => Settings.close());
        }

        // Editor tool buttons
        const formatBtn = document.getElementById('formatBtn');
        const minifyBtn = document.getElementById('minifyBtn');
        const copyBtn = document.getElementById('copyBtn');
        const clearBtn = document.getElementById('clearBtn');
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (formatBtn) formatBtn.addEventListener('click', () => Editor.format());
        if (minifyBtn) minifyBtn.addEventListener('click', () => Editor.minify());
        if (copyBtn) copyBtn.addEventListener('click', () => Editor.copy());
        if (clearBtn) clearBtn.addEventListener('click', () => Editor.clear());
        if (undoBtn) undoBtn.addEventListener('click', () => Editor.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => Editor.redo());

        // Preview tool buttons
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const toggleGridBtn = document.getElementById('toggleGridBtn');
        const toggleViewBoxBtn = document.getElementById('toggleViewBoxBtn');
        const fitToScreenBtn = document.getElementById('fitToScreenBtn');
        const centerViewBtn = document.getElementById('centerViewBtn');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => Preview.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => Preview.zoomOut());
        if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => Preview.resetZoom());
        if (toggleGridBtn) toggleGridBtn.addEventListener('click', () => this.toggleGrid());
        if (toggleViewBoxBtn) toggleViewBoxBtn.addEventListener('click', () => this.toggleViewBox());
        if (fitToScreenBtn) fitToScreenBtn.addEventListener('click', () => Preview.fitToScreen());
        if (centerViewBtn) centerViewBtn.addEventListener('click', () => Preview.centerView());

        // Settings changes
        const fontSize = document.getElementById('fontSize');
        const tabSize = document.getElementById('tabSize');
        const showGrid = document.getElementById('showGrid');
        const gridSize = document.getElementById('gridSize');
        const showViewBox = document.getElementById('showViewBox');
        const defaultZoom = document.getElementById('defaultZoom');

        if (fontSize) fontSize.addEventListener('change', (e) => this.updateFontSize(e.target.value));
        if (tabSize) tabSize.addEventListener('change', (e) => this.updateTabSize(e.target.value));
        if (showGrid) showGrid.addEventListener('change', (e) => this.toggleGridSetting(e.target.checked));
        if (gridSize) gridSize.addEventListener('change', (e) => this.updateGridSize(e.target.value));
        if (showViewBox) showViewBox.addEventListener('change', (e) => this.toggleViewBoxSetting(e.target.checked));
        if (defaultZoom) defaultZoom.addEventListener('change', (e) => {
            Preview.zoomLevel = parseInt(e.target.value);
            Preview.applyZoom();
        });
    },

    // New upload function
    uploadSVG() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.svg,image/svg+xml';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                Editor.setValue(e.target.result);
                this.updatePreview();
                Toast.success('SVG uploaded successfully');
            };
            reader.readAsText(file);
        };
        
        input.click();
    },

    // Rest of the App object remains the same...
    setupLayout() {
        const checkLayout = () => {
            const width = window.innerWidth;
            const mainContent = document.getElementById('mainContent');
            
            if (width < 768) {
                mainContent.style.gridTemplateColumns = '1fr';
                mainContent.style.gridTemplateRows = '1fr 1fr';
                // Hide text labels on mobile
                document.querySelectorAll('.btn-text').forEach(el => {
                    el.style.display = 'none';
                });
            } else {
                mainContent.style.gridTemplateColumns = '1fr 1fr';
                mainContent.style.gridTemplateRows = '1fr';
                // Show text labels on desktop
                document.querySelectorAll('.btn-text').forEach(el => {
                    el.style.display = 'inline';
                });
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
        
        if (charCount) {
            charCount.innerHTML = `
                <i data-lucide="text" class="icon-sm"></i>
                <span>${editor.value.length} chars</span>
            `;
        }
        
        if (lineCount) {
            lineCount.innerHTML = `
                <i data-lucide="edit-3" class="icon-sm"></i>
                <span>Lines: ${editor.value.split('\n').length}</span>
            `;
        }
        
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
        if (elementCount) {
            elementCount.innerHTML = `
                <i data-lucide="layers" class="icon-sm"></i>
                <span>Elements: ${count}</span>
            `;
        }
        if (window.lucide) lucide.createIcons();
    },

    updateObjectInfo(id) {
        const selectedObject = document.getElementById('selectedObject');
        const objectPosition = document.getElementById('objectPosition');
        const objectSize = document.getElementById('objectSize');
        
        if (id && Preview.elementData && Preview.elementData[id]) {
            const data = Preview.elementData[id];
            if (selectedObject) selectedObject.textContent = `${data.tag} #${id}`;
            if (objectPosition) objectPosition.textContent = `x: ${Math.round(data.position.x)}, y: ${Math.round(data.position.y)}`;
            if (objectSize) objectSize.textContent = `${Math.round(data.size.width)}×${Math.round(data.size.height)}`;
        } else {
            if (selectedObject) selectedObject.textContent = 'No selection';
            if (objectPosition) objectPosition.textContent = '';
            if (objectSize) objectSize.textContent = '';
        }
    },

    // Grid functions
    toggleGrid() {
        this.isGridVisible = !this.isGridVisible;
        const gridOverlay = document.getElementById('gridOverlay');
        const toggleGridBtn = document.getElementById('toggleGridBtn');
        
        if (gridOverlay) gridOverlay.classList.toggle('active', this.isGridVisible);
        if (toggleGridBtn) toggleGridBtn.classList.toggle('active', this.isGridVisible);
        Toast.info(this.isGridVisible ? 'Grid enabled' : 'Grid disabled');
    },

    toggleGridSetting(visible) {
        this.isGridVisible = visible;
        const gridOverlay = document.getElementById('gridOverlay');
        const showGrid = document.getElementById('showGrid');
        
        if (gridOverlay) gridOverlay.classList.toggle('active', visible);
        if (showGrid) showGrid.checked = visible;
    },

    updateGrid() {
        const gridSize = parseInt(localStorage.getItem('svgEditor_gridSize') || '20');
        const gridOverlay = document.getElementById('gridOverlay');
        if (gridOverlay) {
            gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        }
    },

    updateGridSize(size) {
        localStorage.setItem('svgEditor_gridSize', size);
        this.updateGrid();
        Toast.success(`Grid size set to ${size}px`);
    },

    // ViewBox functions
    toggleViewBox() {
        this.isViewBoxVisible = !this.isViewBoxVisible;
        const viewboxIndicator = document.getElementById('viewboxIndicator');
        const toggleViewBoxBtn = document.getElementById('toggleViewBoxBtn');
        
        if (viewboxIndicator) viewboxIndicator.classList.toggle('active', this.isViewBoxVisible);
        if (toggleViewBoxBtn) toggleViewBoxBtn.classList.toggle('active', this.isViewBoxVisible);
    },

    toggleViewBoxSetting(visible) {
        this.isViewBoxVisible = visible;
        const viewboxIndicator = document.getElementById('viewboxIndicator');
        const showViewBox = document.getElementById('showViewBox');
        
        if (viewboxIndicator) viewboxIndicator.classList.toggle('active', visible);
        if (showViewBox) showViewBox.checked = visible;
    },

    updateViewBox() {
        const svgElement = document.getElementById('preview')?.firstChild;
        const indicator = document.getElementById('viewboxIndicator');
        
        if (svgElement && svgElement.tagName === 'svg' && indicator) {
            const viewBox = Utils.getViewBox(svgElement);
            if (viewBox) {
                const containerRect = document.querySelector('.preview-container')?.getBoundingClientRect();
                if (!containerRect) return;
                
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
            opt.classList.toggle('selected', opt.dataset?.theme === theme);
        });
        
        if (window.lucide) lucide.createIcons();
        Toast.success(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`);
    },

    updateFontSize(size) {
        if (Editor.element) {
            Editor.element.style.fontSize = size + 'px';
        }
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
