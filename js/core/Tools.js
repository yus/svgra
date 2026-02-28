// Tools.js

const Tools = {
    currentTool: 'select',
    toolsPanel: document.getElementById('toolsPanel'),
    activeElement: null,
    transformHandles: [],
    
    tools: [
        {
            id: 'selectTool',
            name: 'Selector',
            icon: 'mouse-pointer-2',
            tooltip: 'Select elements (S)',
            color: '#2d4c6c',
            shortcut: 's'
        },
        {
            id: 'transformTool',
            name: 'Transform',
            icon: 'move',
            tooltip: 'Move, scale, rotate (T)',
            color: '#4a6a8c',
            shortcut: 't'
        },
        {
            id: 'shapeTool',
            name: 'Shaper',
            icon: 'pen-tool',
            tooltip: 'Edit shapes (H)',
            color: '#6a8cac',
            shortcut: 'h'
        },
        {
            id: 'textTool',
            name: 'Type',
            icon: 'type',
            tooltip: 'Edit text (X)',
            color: '#8caccc',
            shortcut: 'x'
        }
    ],

    workspaceTools: [
        { id: 'zoomInBtn', icon: 'zoom-in', title: 'Zoom In (Ctrl++)' },
        { id: 'zoomOutBtn', icon: 'zoom-out', title: 'Zoom Out (Ctrl+-)' },
        { id: 'resetZoomBtn', icon: 'maximize-2', title: 'Reset Zoom' },
        null,
        { id: 'toggleGridBtn', icon: 'grid', title: 'Toggle Grid' },
        { id: 'toggleViewBoxBtn', icon: 'frame', title: 'Toggle ViewBox' },
        null,
        { id: 'fitToScreenBtn', icon: 'crop', title: 'Fit to Screen' },
        { id: 'centerViewBtn', icon: 'move', title: 'Center View' }
    ],

    init() {
        this.renderTools();
        this.renderWorkspaceToolbar();
        this.setActive('selectTool');
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    },

    renderTools() {
        if (!this.toolsPanel) return;
        this.toolsPanel.innerHTML = '';
        
        this.tools.forEach(tool => {
            const button = document.createElement('button');
            button.id = tool.id;
            button.className = 'tool-btn';
            button.setAttribute('data-tooltip', tool.tooltip);
            button.setAttribute('data-shortcut', tool.shortcut);
            button.innerHTML = `<i data-lucide="${tool.icon}" class="icon" style="color: ${tool.color}"></i>`;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setActive(tool.id);
            });
            
            this.toolsPanel.appendChild(button);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    renderWorkspaceToolbar() {
        const toolbar = document.getElementById('workspaceToolbar');
        if (!toolbar) return;
        
        toolbar.innerHTML = '';
        let currentGroup = [];
        
        this.workspaceTools.forEach(tool => {
            if (tool === null) {
                if (currentGroup.length > 0) {
                    toolbar.appendChild(this.createToolGroup(currentGroup));
                    currentGroup = [];
                }
                toolbar.appendChild(this.createSeparator());
            } else {
                const button = this.createToolButton(tool);
                currentGroup.push(button);
            }
        });
        
        if (currentGroup.length > 0) {
            toolbar.appendChild(this.createToolGroup(currentGroup));
        }
        
        if (window.lucide) lucide.createIcons();
    },

    createToolButton(tool) {
        const button = document.createElement('button');
        button.id = tool.id;
        button.className = 'btn btn-icon';
        button.title = tool.title;
        button.innerHTML = `<i data-lucide="${tool.icon}" class="icon"></i>`;
        
        switch(tool.id) {
            case 'zoomInBtn':
                button.addEventListener('click', () => Preview.zoomIn());
                break;
            case 'zoomOutBtn':
                button.addEventListener('click', () => Preview.zoomOut());
                break;
            case 'resetZoomBtn':
                button.addEventListener('click', () => Preview.resetZoom());
                break;
            case 'toggleGridBtn':
                button.addEventListener('click', () => App.toggleGrid());
                break;
            case 'toggleViewBoxBtn':
                button.addEventListener('click', () => App.toggleViewBox());
                break;
            case 'fitToScreenBtn':
                button.addEventListener('click', () => Preview.fitToScreen());
                break;
            case 'centerViewBtn':
                button.addEventListener('click', () => Preview.centerView());
                break;
        }
        
        return button;
    },

    createToolGroup(buttons) {
        const group = document.createElement('div');
        group.className = 'tool-group';
        buttons.forEach(btn => group.appendChild(btn));
        return group;
    },

    createSeparator() {
        const sep = document.createElement('div');
        sep.className = 'tool-separator';
        return sep;
    },

    setupEventListeners() {
        // Make elements selectable in preview
        document.getElementById('previewContainer').addEventListener('mouseover', (e) => {
            const element = this.findSVGElement(e.target);
            if (element && element.id) {
                element.classList.add('element-highlight', 'hover');
            }
        });

        document.getElementById('previewContainer').addEventListener('mouseout', (e) => {
            const element = this.findSVGElement(e.target);
            if (element) {
                element.classList.remove('element-highlight', 'hover');
            }
        });

        document.getElementById('previewContainer').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const element = this.findSVGElement(e.target);
            if (element && element.id) {
                this.selectElement(element);
            } else {
                this.deselectElement();
            }
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase();
            switch(key) {
                case 's': this.setActive('selectTool'); e.preventDefault(); break;
                case 't': this.setActive('transformTool'); e.preventDefault(); break;
                case 'h': this.setActive('shapeTool'); e.preventDefault(); break;
                case 'x': this.setActive('textTool'); e.preventDefault(); break;
                case '+': case '=': if (e.ctrlKey) { Preview.zoomIn(); e.preventDefault(); } break;
                case '-': if (e.ctrlKey) { Preview.zoomOut(); e.preventDefault(); } break;
                case '0': if (e.ctrlKey) { Preview.resetZoom(); e.preventDefault(); } break;
            }
        });
    },

    findSVGElement(target) {
        while (target && target.id !== 'preview' && target !== document.body) {
            if (target.tagName && target.tagName !== 'svg' && target.id) {
                return target;
            }
            target = target.parentElement;
        }
        return null;
    },

    selectElement(element) {
        // Remove previous selection
        if (this.activeElement) {
            this.activeElement.classList.remove('element-highlight');
            this.removeTransformHandles();
        }
        
        this.activeElement = element;
        element.classList.add('element-highlight');
        
        // Update preview selection
        Preview.selectElement(element.id);
        
        // Execute current tool
        this.handleElementSelect(element.id);
        
        // Show tool-specific UI
        if (this.currentTool === 'transformTool') {
            this.addTransformHandles(element);
        }
    },

    deselectElement() {
        if (this.activeElement) {
            this.activeElement.classList.remove('element-highlight');
            this.activeElement = null;
        }
        this.removeTransformHandles();
        Preview.clearSelection();
        this.cancelControls();
    },

    setActive(toolId) {
        this.currentTool = toolId;
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === toolId);
        });
        
        Toast.info(`${this.getToolName(toolId)} tool activated`);
        
        // If there's an active element, refresh tool UI
        if (this.activeElement) {
            this.handleElementSelect(this.activeElement.id);
        }
    },

    getToolName(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        return tool ? tool.name : 'Unknown';
    },

    handleElementSelect(elementId) {
        if (!elementId || !this.activeElement) return;
        
        // Remove any existing popups
        this.cancelControls();
        
        // Execute current tool action
        switch (this.currentTool) {
            case 'selectTool':
                this.showElementInfo(this.activeElement);
                break;
            case 'transformTool':
                this.showTransformControls(this.activeElement);
                break;
            case 'shapeTool':
                this.showShapeControls(this.activeElement);
                break;
            case 'textTool':
                this.showTextControls(this.activeElement);
                break;
        }
    },

    showElementInfo(element) {
        const tag = element.tagName;
        const id = element.id;
        const classes = element.getAttribute('class') || '';
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        const popup = this.createPopup('Element Info', `
            <div><strong>Tag:</strong> ${tag}</div>
            <div><strong>ID:</strong> ${id}</div>
            <div><strong>Class:</strong> ${classes || '(none)'}</div>
            <div><strong>Position:</strong> (${Math.round(bbox.x)}, ${Math.round(bbox.y)})</div>
            <div><strong>Size:</strong> ${Math.round(bbox.width)}×${Math.round(bbox.height)}</div>
        `);
        
        this.positionPopup(popup, element);
    },

    showTransformControls(element) {
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        const content = `
            <div style="display: grid; gap: 8px;">
                <label>
                    <span>X:</span>
                    <input type="number" id="transformX" value="${Math.round(bbox.x)}" step="1">
                </label>
                <label>
                    <span>Y:</span>
                    <input type="number" id="transformY" value="${Math.round(bbox.y)}" step="1">
                </label>
                <label>
                    <span>Width:</span>
                    <input type="number" id="transformWidth" value="${Math.round(bbox.width)}" step="1" min="1">
                </label>
                <label>
                    <span>Height:</span>
                    <input type="number" id="transformHeight" value="${Math.round(bbox.height)}" step="1" min="1">
                </label>
                <label>
                    <span>Rotate:</span>
                    <input type="number" id="transformRotate" value="0" step="15">
                </label>
            </div>
        `;
        
        const popup = this.createPopup('Transform', content, [
            { text: 'Apply', action: () => this.applyTransform(element.id) },
            { text: 'Cancel', action: () => this.cancelControls() }
        ]);
        
        this.positionPopup(popup, element);
    },

    showShapeControls(element) {
        const tag = element.tagName.toLowerCase();
        let shapeFields = '';
        
        if (tag === 'circle') {
            const cx = element.getAttribute('cx') || '50';
            const cy = element.getAttribute('cy') || '50';
            const r = element.getAttribute('r') || '40';
            shapeFields = `
                <label><span>CX:</span> <input type="number" id="shapeCx" value="${cx}" step="1"></label>
                <label><span>CY:</span> <input type="number" id="shapeCy" value="${cy}" step="1"></label>
                <label><span>R:</span> <input type="number" id="shapeR" value="${r}" step="1" min="1"></label>
            `;
        } else if (tag === 'rect') {
            const x = element.getAttribute('x') || '0';
            const y = element.getAttribute('y') || '0';
            const width = element.getAttribute('width') || '100';
            const height = element.getAttribute('height') || '100';
            const rx = element.getAttribute('rx') || '0';
            const ry = element.getAttribute('ry') || '0';
            shapeFields = `
                <label><span>X:</span> <input type="number" id="shapeX" value="${x}" step="1"></label>
                <label><span>Y:</span> <input type="number" id="shapeY" value="${y}" step="1"></label>
                <label><span>Width:</span> <input type="number" id="shapeWidth" value="${width}" step="1" min="1"></label>
                <label><span>Height:</span> <input type="number" id="shapeHeight" value="${height}" step="1" min="1"></label>
                <label><span>RX:</span> <input type="number" id="shapeRx" value="${rx}" step="1"></label>
                <label><span>RY:</span> <input type="number" id="shapeRy" value="${ry}" step="1"></label>
            `;
        } else {
            shapeFields = `<div>Editing for ${tag} coming soon</div>`;
        }
        
        const content = `
            <div style="display: grid; gap: 8px;">
                ${shapeFields}
                <label>
                    <span>Fill:</span>
                    <input type="color" id="shapeFill" value="${element.getAttribute('fill') || '#000000'}">
                </label>
                <label>
                    <span>Stroke:</span>
                    <input type="color" id="shapeStroke" value="${element.getAttribute('stroke') || '#000000'}">
                </label>
            </div>
        `;
        
        const popup = this.createPopup(`Edit ${tag}`, content, [
            { text: 'Apply', action: () => this.applyShape(element.id) },
            { text: 'Cancel', action: () => this.cancelControls() }
        ]);
        
        this.positionPopup(popup, element);
    },

    showTextControls(element) {
        if (element.tagName.toLowerCase() !== 'text') {
            Toast.error('Selected element is not text');
            return;
        }
        
        const content = element.textContent;
        const fontSize = element.getAttribute('font-size') || '16';
        const fontFamily = element.getAttribute('font-family') || 'Arial';
        const fontWeight = element.getAttribute('font-weight') || 'normal';
        
        const contentHtml = `
            <div style="display: grid; gap: 8px;">
                <label>
                    <span>Text:</span>
                    <input type="text" id="fontText" value="${content}">
                </label>
                <label>
                    <span>Font:</span>
                    <select id="fontFamily">
                        <option value="Arial" ${fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                        <option value="Helvetica" ${fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                        <option value="Times New Roman" ${fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                        <option value="Courier New" ${fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                        <option value="Georgia" ${fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
                        <option value="Verdana" ${fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
                    </select>
                </label>
                <label>
                    <span>Size:</span>
                    <input type="number" id="fontSize" value="${parseInt(fontSize)}" min="8" max="72" step="1">
                </label>
                <label>
                    <span>Weight:</span>
                    <select id="fontWeight">
                        <option value="normal" ${fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="bold" ${fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                        <option value="300" ${fontWeight === '300' ? 'selected' : ''}>Light</option>
                        <option value="500" ${fontWeight === '500' ? 'selected' : ''}>Medium</option>
                    </select>
                </label>
                <label>
                    <span>Color:</span>
                    <input type="color" id="fontColor" value="${element.getAttribute('fill') || '#000000'}">
                </label>
            </div>
        `;
        
        const popup = this.createPopup('Edit Text', contentHtml, [
            { text: 'Apply', action: () => this.applyText(element.id) },
            { text: 'Cancel', action: () => this.cancelControls() }
        ]);
        
        this.positionPopup(popup, element);
    },

    createPopup(title, content, buttons = []) {
        const popup = document.createElement('div');
        popup.className = 'tool-popup';
        popup.innerHTML = `
            <div class="tool-popup-header">
                <span>${title}</span>
                <button class="btn-icon" onclick="Tools.cancelControls()">
                    <i data-lucide="x" class="icon-sm"></i>
                </button>
            </div>
            <div class="tool-popup-body">
                ${content}
            </div>
            ${buttons.length ? '<div class="tool-popup-footer"></div>' : ''}
        `;
        
        if (buttons.length) {
            const footer = popup.querySelector('.tool-popup-footer');
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = 'btn';
                button.textContent = btn.text;
                button.addEventListener('click', btn.action);
                footer.appendChild(button);
            });
        }
        
        document.getElementById('previewContainer').appendChild(popup);
        
        if (window.lucide) lucide.createIcons();
        
        return popup;
    },

    positionPopup(popup, element) {
        const pos = Utils.getElementPosition(element, document.querySelector('.workspace-area'));
        const popupRect = popup.getBoundingClientRect();
        const containerRect = document.querySelector('.workspace-area').getBoundingClientRect();
        
        let left = pos.left + pos.width + 10;
        let top = pos.top;
        
        // Adjust if off-screen
        if (left + popupRect.width > containerRect.width) {
            left = pos.left - popupRect.width - 10;
        }
        
        if (top + popupRect.height > containerRect.height) {
            top = containerRect.height - popupRect.height - 10;
        }
        
        if (top < 0) top = 10;
        
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    },

    addTransformHandles(element) {
        this.removeTransformHandles();
        
        const bbox = element.getBBox();
        const pos = Utils.getElementPosition(element, document.querySelector('.workspace-area'));
        
        const handlePositions = [
            { x: pos.left, y: pos.top, cursor: 'nw-resize' },
            { x: pos.left + pos.width / 2, y: pos.top, cursor: 'n-resize' },
            { x: pos.left + pos.width, y: pos.top, cursor: 'ne-resize' },
            { x: pos.left + pos.width, y: pos.top + pos.height / 2, cursor: 'e-resize' },
            { x: pos.left + pos.width, y: pos.top + pos.height, cursor: 'se-resize' },
            { x: pos.left + pos.width / 2, y: pos.top + pos.height, cursor: 's-resize' },
            { x: pos.left, y: pos.top + pos.height, cursor: 'sw-resize' },
            { x: pos.left, y: pos.top + pos.height / 2, cursor: 'w-resize' }
        ];
        
        handlePositions.forEach((pos, i) => {
            const handle = document.createElement('div');
            handle.className = 'transform-handle';
            handle.style.left = (pos.x - 4) + 'px';
            handle.style.top = (pos.y - 4) + 'px';
            handle.style.cursor = pos.cursor;
            handle.setAttribute('data-handle', i);
            
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startTransform(element, i, e);
            });
            
            document.getElementById('previewContainer').appendChild(handle);
            this.transformHandles.push(handle);
        });
    },

    removeTransformHandles() {
        this.transformHandles.forEach(handle => handle.remove());
        this.transformHandles = [];
    },

    startTransform(element, handleIndex, e) {
        // Transform logic would go here
        console.log('Start transform', element.id, handleIndex);
    },

    applyTransform(elementId) {
        const element = this.activeElement;
        if (!element) return;
        
        const x = document.getElementById('transformX')?.value;
        const y = document.getElementById('transformY')?.value;
        const width = document.getElementById('transformWidth')?.value;
        const height = document.getElementById('transformHeight')?.value;
        const rotate = document.getElementById('transformRotate')?.value;
        
        if (x !== undefined) element.setAttribute('x', x);
        if (y !== undefined) element.setAttribute('y', y);
        if (width !== undefined) element.setAttribute('width', width);
        if (height !== undefined) element.setAttribute('height', height);
        if (rotate !== undefined && rotate != 0) {
            element.setAttribute('transform', `rotate(${rotate})`);
        }
        
        this.updateEditor();
        Toast.success('Transform applied');
        this.cancelControls();
    },

    applyShape(elementId) {
        const element = this.activeElement;
        if (!element) return;
        
        const tag = element.tagName.toLowerCase();
        
        if (tag === 'circle') {
            const cx = document.getElementById('shapeCx')?.value;
            const cy = document.getElementById('shapeCy')?.value;
            const r = document.getElementById('shapeR')?.value;
            if (cx) element.setAttribute('cx', cx);
            if (cy) element.setAttribute('cy', cy);
            if (r) element.setAttribute('r', r);
        } else if (tag === 'rect') {
            const x = document.getElementById('shapeX')?.value;
            const y = document.getElementById('shapeY')?.value;
            const width = document.getElementById('shapeWidth')?.value;
            const height = document.getElementById('shapeHeight')?.value;
            const rx = document.getElementById('shapeRx')?.value;
            const ry = document.getElementById('shapeRy')?.value;
            if (x) element.setAttribute('x', x);
            if (y) element.setAttribute('y', y);
            if (width) element.setAttribute('width', width);
            if (height) element.setAttribute('height', height);
            if (rx) element.setAttribute('rx', rx);
            if (ry) element.setAttribute('ry', ry);
        }
        
        const fill = document.getElementById('shapeFill')?.value;
        const stroke = document.getElementById('shapeStroke')?.value;
        if (fill) element.setAttribute('fill', fill);
        if (stroke) element.setAttribute('stroke', stroke);
        
        this.updateEditor();
        Toast.success('Shape updated');
        this.cancelControls();
    },

    applyText(elementId) {
        const element = this.activeElement;
        if (!element) return;
        
        const fontFamily = document.getElementById('fontFamily')?.value;
        const fontSize = document.getElementById('fontSize')?.value;
        const fontWeight = document.getElementById('fontWeight')?.value;
        const fontColor = document.getElementById('fontColor')?.value;
        const fontText = document.getElementById('fontText')?.value;
        
        if (fontFamily) element.setAttribute('font-family', fontFamily);
        if (fontSize) element.setAttribute('font-size', fontSize + 'px');
        if (fontWeight) element.setAttribute('font-weight', fontWeight);
        if (fontColor) element.setAttribute('fill', fontColor);
        if (fontText) element.textContent = fontText;
        
        this.updateEditor();
        Toast.success('Text updated');
        this.cancelControls();
    },

    updateEditor() {
        const preview = document.getElementById('preview');
        if (preview && preview.firstChild) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(preview.firstChild);
            Editor.setValue(svgString);
        }
    },

    cancelControls() {
        const popups = document.querySelectorAll('.tool-popup');
        popups.forEach(popup => popup.remove());
        this.removeTransformHandles();
    }
};
