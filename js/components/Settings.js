// Settings.js

const Settings = {
    modal: document.getElementById('settingsModal'),
    
    open() {
        this.modal.classList.add('active');
        if (window.lucide) lucide.createIcons();
    },

    close() {
        this.modal.classList.remove('active');
        this.save();
    },

    render() {
        const body = document.getElementById('settingsBody');
        if (!body) return;
        
        body.innerHTML = `
            <div class="settings-group">
                <h3><i data-lucide="palette" class="icon-sm"></i> Theme</h3>
                <div class="theme-option" data-theme="light">
                    <div class="theme-preview light"></div>
                    <span>Light Theme</span>
                </div>
                <div class="theme-option" data-theme="dark">
                    <div class="theme-preview dark"></div>
                    <span>Dark Theme</span>
                </div>
                <div class="theme-option" data-theme="monokai">
                    <div class="theme-preview monokai"></div>
                    <span>Monokai Theme</span>
                </div>
            </div>
            
            <div class="settings-group">
                <h3><i data-lucide="code-2" class="icon-sm"></i> Editor Settings</h3>
                <div class="setting-item">
                    <span>Font Size</span>
                    <select id="fontSize">
                        <option value="12">12px</option>
                        <option value="13" selected>13px</option>
                        <option value="14">14px</option>
                        <option value="15">15px</option>
                        <option value="16">16px</option>
                    </select>
                </div>
                <div class="setting-item">
                    <span>Tab Size</span>
                    <select id="tabSize">
                        <option value="2">2 spaces</option>
                        <option value="4" selected>4 spaces</option>
                        <option value="8">8 spaces</option>
                        <option value="tab">Tab character</option>
                    </select>
                </div>
                <div class="setting-item">
                    <span>Auto Update Preview</span>
                    <input type="checkbox" id="autoUpdate" checked>
                </div>
            </div>
            
            <div class="settings-group">
                <h3><i data-lucide="eye" class="icon-sm"></i> Preview Settings</h3>
                <div class="setting-item">
                    <span>Show Grid</span>
                    <input type="checkbox" id="showGrid">
                </div>
                <div class="setting-item">
                    <span>Grid Size</span>
                    <input type="number" id="gridSize" value="20" min="5" max="100">
                </div>
                <div class="setting-item">
                    <span>Show ViewBox</span>
                    <input type="checkbox" id="showViewBox">
                </div>
                <div class="setting-item">
                    <span>Default Zoom</span>
                    <select id="defaultZoom">
                        <option value="100">100%</option>
                        <option value="75">75%</option>
                        <option value="50">50%</option>
                        <option value="200">200%</option>
                    </select>
                </div>
            </div>
        `;
        
        // Add theme click handlers
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const theme = opt.dataset.theme;
                if (App) App.setTheme(theme);
            });
        });
    },

    load() {
        // Theme
        const theme = localStorage.getItem('svgEditor_theme') || 'light';
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.theme === theme);
        });
        
        // Font size
        const fontSize = localStorage.getItem('svgEditor_fontSize') || '13';
        document.getElementById('fontSize').value = fontSize;
        
        // Tab size
        const tabSize = localStorage.getItem('svgEditor_tabSize') || '4';
        document.getElementById('tabSize').value = tabSize;
        
        // Auto update
        const autoUpdate = localStorage.getItem('svgEditor_autoUpdate') !== 'false';
        document.getElementById('autoUpdate').checked = autoUpdate;
        
        // Grid
        const showGrid = localStorage.getItem('svgEditor_showGrid') === 'true';
        document.getElementById('showGrid').checked = showGrid;
        
        // Grid size
        const gridSize = localStorage.getItem('svgEditor_gridSize') || '20';
        document.getElementById('gridSize').value = gridSize;
        
        // ViewBox
        const showViewBox = localStorage.getItem('svgEditor_showViewBox') === 'true';
        document.getElementById('showViewBox').checked = showViewBox;
        
        // Default zoom
        const defaultZoom = localStorage.getItem('svgEditor_defaultZoom') || '100';
        document.getElementById('defaultZoom').value = defaultZoom;
    },

    save() {
        localStorage.setItem('svgEditor_theme', document.body.className);
        localStorage.setItem('svgEditor_fontSize', document.getElementById('fontSize').value);
        localStorage.setItem('svgEditor_tabSize', document.getElementById('tabSize').value);
        localStorage.setItem('svgEditor_autoUpdate', document.getElementById('autoUpdate').checked);
        localStorage.setItem('svgEditor_showGrid', document.getElementById('showGrid').checked);
        localStorage.setItem('svgEditor_gridSize', document.getElementById('gridSize').value);
        localStorage.setItem('svgEditor_showViewBox', document.getElementById('showViewBox').checked);
        localStorage.setItem('svgEditor_defaultZoom', document.getElementById('defaultZoom').value);
        
        Toast.success('Settings saved');
    }
};
