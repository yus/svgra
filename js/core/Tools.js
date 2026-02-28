// Tools.js

const Tools = {
    currentTool: 'select',
    toolsPanel: document.getElementById('toolsPanel'),
    preferencePane: document.getElementById('preferencePane'),
    activeElement: null,
    isUpdating: false,
    
    tools: [
        {
            id: 'selectTool',
            name: 'Selector',
            icon: 'mouse-pointer-2',
            tooltip: 'Select elements (S)',
            shortcut: 's'
        },
        {
            id: 'transformTool',
            name: 'Transform',
            icon: 'move',
            tooltip: 'Move, scale, rotate (X)',
            shortcut: 'x'
        },
        {
            id: 'shapeTool',
            name: 'Shaper',
            icon: 'pen-tool',
            tooltip: 'Edit shapes (H)',
            shortcut: 'h'
        },
        {
            id: 'textTool',
            name: 'Type',
            icon: 'type',
            tooltip: 'Edit text (T)',
            shortcut: 't'
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
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.hidePreferencePane();
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
            button.innerHTML = `<i data-lucide="${tool.icon}" class="icon"></i>`;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setActive(tool.id);
            });
            
            this.toolsPanel.appendChild(button);
        });
        
        if (window.lucide) lucide.createIcons();
        this.setActive('selectTool');
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
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;

        // Hover effect
        previewContainer.addEventListener('mouseover', (e) => {
            const element = Utils.findSVGElement(e.target, previewContainer);
            if (element && element.id && element !== this.activeElement) {
                element.classList.add('element-hover');
                
                // Transform tool cursor
                if (this.currentTool === 'transformTool') {
                    element.style.cursor = 'move';
                }
            }
        });

        previewContainer.addEventListener('mouseout', (e) => {
            const element = Utils.findSVGElement(e.target, previewContainer);
            if (element) {
                element.classList.remove('element-hover');
                element.style.cursor = '';
            }
        });

        // Selection click
        previewContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const element = Utils.findSVGElement(e.target, previewContainer);
            
            if (element && element.id) {
                this.selectElement(element);
                this.scrollToElementInEditor(element.id);
            } else {
                this.deselectElement();
            }
        });

        // Editor change sync
        document.getElementById('editor').addEventListener('input', () => {
            if (!this.isUpdating && this.activeElement) {
                // Could sync from editor to preview if needed
            }
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase();
            switch(key) {
                case 's': this.setActive('selectTool'); e.preventDefault(); break;
                case 'x': this.setActive('transformTool'); e.preventDefault(); break;
                case 'h': this.setActive('shapeTool'); e.preventDefault(); break;
                case 't': this.setActive('textTool'); e.preventDefault(); break;
                case 'escape': this.deselectElement(); e.preventDefault(); break;
            }
        });
    },

    selectElement(element) {
        // Remove previous selection
        if (this.activeElement) {
            this.activeElement.classList.remove('element-hover');
        }
        
        this.activeElement = element;
        
        // Update preview selection
        Preview.selectElement(element.id);
        
        // Show preference pane
        this.showPreferencePane();
        
        // Update pane title
        document.getElementById('paneTitle').textContent = 
            `${this.getToolName(this.currentTool)} - ${element.tagName}#${element.id}`;
        
        // Render tool-specific content
        this.updatePreferencePaneContent();
    },

    deselectElement() {
        if (this.activeElement) {
            this.activeElement.classList.remove('element-hover');
            this.activeElement = null;
        }
        
        Preview.clearSelection();
        this.hidePreferencePane();
        document.getElementById('paneTitle').textContent = 'No selection';
    },

    setActive(toolId) {
        this.currentTool = toolId;
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === toolId);
        });
        
        if (this.activeElement) {
            document.getElementById('paneTitle').textContent = 
                `${this.getToolName(toolId)} - ${this.activeElement.tagName}#${this.activeElement.id}`;
            this.updatePreferencePaneContent();
        }
        
        Toast.info(`${this.getToolName(toolId)} tool activated`);
    },

    getToolName(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        return tool ? tool.name : 'Unknown';
    },

    showPreferencePane() {
        if (this.preferencePane) {
            this.preferencePane.classList.remove('collapsed');
        }
    },

    hidePreferencePane() {
        if (this.preferencePane) {
            this.preferencePane.classList.add('collapsed');
        }
    },

    updatePreferencePaneContent() {
        const content = document.getElementById('paneContent');
        if (!content || !this.activeElement) return;
        
        switch (this.currentTool) {
            case 'selectTool':
                this.renderSelectPane(content);
                break;
            case 'transformTool':
                this.renderTransformPane(content);
                break;
            case 'shapeTool':
                this.renderShapePane(content);
                break;
            case 'textTool':
                this.renderTextPane(content);
                break;
        }
        
        if (window.lucide) lucide.createIcons();
    },

    // SELECT TOOL - Enhanced with editable fields
    renderSelectPane(content) {
        const element = this.activeElement;
        const tag = element.tagName;
        const id = element.id;
        const classes = element.getAttribute('class') || '';
        const fill = element.getAttribute('fill') || '#000000';
        const stroke = element.getAttribute('stroke') || 'none';
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        content.innerHTML = `
            <div class="property-group">
                <h4>Element Properties</h4>
                <label>
                    <span>Tag:</span>
                    <input type="text" value="${tag}" id="elemTag" onchange="Tools.updateElementAttribute('tag', this.value)">
                </label>
                <label>
                    <span>ID:</span>
                    <input type="text" value="${id}" id="elemId" onchange="Tools.updateElementAttribute('id', this.value)">
                </label>
                <label>
                    <span>Class:</span>
                    <input type="text" value="${classes}" id="elemClass" onchange="Tools.updateElementAttribute('class', this.value)">
                </label>
            </div>
            <div class="property-group">
                <h4>Colors</h4>
                <label>
                    <span>Fill:</span>
                    <input type="color" value="${fill}" id="elemFill" onchange="Tools.updateElementAttribute('fill', this.value)">
                    <span class="color-hex">${fill}</span>
                </label>
                <label>
                    <span>Stroke:</span>
                    <input type="color" value="${stroke === 'none' ? '#000000' : stroke}" id="elemStroke" onchange="Tools.updateElementAttribute('stroke', this.value)">
                    <span class="color-hex">${stroke}</span>
                </label>
            </div>
            <div class="property-group">
                <h4>Position & Size (readonly)</h4>
                <label>X: <input type="number" value="${Math.round(bbox.x)}" readonly></label>
                <label>Y: <input type="number" value="${Math.round(bbox.y)}" readonly></label>
                <label>Width: <input type="number" value="${Math.round(bbox.width)}" readonly></label>
                <label>Height: <input type="number" value="${Math.round(bbox.height)}" readonly></label>
            </div>
        `;
    },

    // TRANSFORM TOOL - Enhanced with real-time sync
    renderTransformPane(content) {
        const element = this.activeElement;
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        content.innerHTML = `
            <div class="property-group">
                <h4>Position</h4>
                <label>
                    <span>X:</span>
                    <input type="number" id="transformX" value="${Math.round(bbox.x)}" step="1" onchange="Tools.applyTransform()" oninput="Tools.previewTransform()">
                </label>
                <label>
                    <span>Y:</span>
                    <input type="number" id="transformY" value="${Math.round(bbox.y)}" step="1" onchange="Tools.applyTransform()" oninput="Tools.previewTransform()">
                </label>
            </div>
            <div class="property-group">
                <h4>Size</h4>
                <label>
                    <span>Width:</span>
                    <input type="number" id="transformWidth" value="${Math.round(bbox.width)}" step="1" min="1" onchange="Tools.applyTransform()" oninput="Tools.previewTransform()">
                </label>
                <label>
                    <span>Height:</span>
                    <input type="number" id="transformHeight" value="${Math.round(bbox.height)}" step="1" min="1" onchange="Tools.applyTransform()" oninput="Tools.previewTransform()">
                </label>
            </div>
            <div class="property-group">
                <h4>Rotation</h4>
                <label>
                    <span>Angle:</span>
                    <input type="range" id="transformRotate" value="0" min="0" max="360" step="15" onchange="Tools.applyTransform()" oninput="Tools.previewTransform()">
                    <input type="number" id="transformRotateValue" value="0" step="15" onchange="Tools.applyTransform()" style="width: 60px;">
                </label>
            </div>
        `;

        // Sync range and number inputs
        const range = document.getElementById('transformRotate');
        const number = document.getElementById('transformRotateValue');
        if (range && number) {
            range.addEventListener('input', () => number.value = range.value);
            number.addEventListener('input', () => range.value = number.value);
        }
    },

    // SHAPE TOOL - Prepared for bezier curves
    renderShapePane(content) {
        const element = this.activeElement;
        const tag = element.tagName.toLowerCase();
        
        let shapeHtml = '';
        
        if (tag === 'circle') {
            const cx = element.getAttribute('cx') || '50';
            const cy = element.getAttribute('cy') || '50';
            const r = element.getAttribute('r') || '40';
            shapeHtml = `
                <div class="property-group">
                    <h4>Circle Properties</h4>
                    <label>CX: <input type="number" id="shapeCx" value="${cx}" step="1" onchange="Tools.applyShape()"></label>
                    <label>CY: <input type="number" id="shapeCy" value="${cy}" step="1" onchange="Tools.applyShape()"></label>
                    <label>R: <input type="number" id="shapeR" value="${r}" step="1" min="1" onchange="Tools.applyShape()"></label>
                </div>
            `;
        } else if (tag === 'rect') {
            const x = element.getAttribute('x') || '0';
            const y = element.getAttribute('y') || '0';
            const width = element.getAttribute('width') || '100';
            const height = element.getAttribute('height') || '100';
            const rx = element.getAttribute('rx') || '0';
            const ry = element.getAttribute('ry') || '0';
            shapeHtml = `
                <div class="property-group">
                    <h4>Rectangle Properties</h4>
                    <label>X: <input type="number" id="shapeX" value="${x}" step="1" onchange="Tools.applyShape()"></label>
                    <label>Y: <input type="number" id="shapeY" value="${y}" step="1" onchange="Tools.applyShape()"></label>
                    <label>Width: <input type="number" id="shapeWidth" value="${width}" step="1" min="1" onchange="Tools.applyShape()"></label>
                    <label>Height: <input type="number" id="shapeHeight" value="${height}" step="1" min="1" onchange="Tools.applyShape()"></label>
                    <label>RX: <input type="number" id="shapeRx" value="${rx}" step="1" onchange="Tools.applyShape()"></label>
                    <label>RY: <input type="number" id="shapeRy" value="${ry}" step="1" onchange="Tools.applyShape()"></label>
                </div>
            `;
        } else if (tag === 'path') {
            const d = element.getAttribute('d') || '';
            shapeHtml = `
                <div class="property-group">
                    <h4>Path Editor (Bezier Coming Soon)</h4>
                    <textarea id="shapePath" rows="4" style="width: 100%; font-family: monospace;" onchange="Tools.applyShape()">${d}</textarea>
                    <p style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;">
                        Future: Visual bezier curve editing
                    </p>
                </div>
            `;
        }
        
        content.innerHTML = shapeHtml + `
            <div class="property-group">
                <h4>Appearance</h4>
                <label>Fill: <input type="color" id="shapeFill" value="${element.getAttribute('fill') || '#000000'}" onchange="Tools.applyShape()"></label>
                <label>Stroke: <input type="color" id="shapeStroke" value="${element.getAttribute('stroke') || '#000000'}" onchange="Tools.applyShape()"></label>
            </div>
        `;
    },

    // TEXT TOOL - Enhanced with font features
    renderTextPane(content) {
        const element = this.activeElement;
        const textContent = element.textContent;
        const fontSize = element.getAttribute('font-size') || '16';
        const fontFamily = element.getAttribute('font-family') || 'Arial';
        const fontWeight = element.getAttribute('font-weight') || 'normal';
        const fontStyle = element.getAttribute('font-style') || 'normal';
        const textAnchor = element.getAttribute('text-anchor') || 'start';
        const fill = element.getAttribute('fill') || '#000000';
        
        content.innerHTML = `
            <div class="property-group">
                <h4>Text Content</h4>
                <label>
                    <span>Text:</span>
                    <input type="text" id="fontText" value="${textContent}" onchange="Tools.applyText()" placeholder="Enter text...">
                </label>
                <small>Press Enter to apply, or edit directly in SVG Editor</small>
            </div>
            <div class="property-group">
                <h4>Font Family</h4>
                <select id="fontFamily" onchange="Tools.applyText()" style="width: 100%;">
                    <option value="Arial" ${fontFamily === 'Arial' ? 'selected' : ''}>Arial (sans-serif)</option>
                    <option value="Helvetica" ${fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica (sans-serif)</option>
                    <option value="Times New Roman" ${fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman (serif)</option>
                    <option value="Georgia" ${fontFamily === 'Georgia' ? 'selected' : ''}>Georgia (serif)</option>
                    <option value="Courier New" ${fontFamily === 'Courier New' ? 'selected' : ''}>Courier New (monospace)</option>
                    <option value="Verdana" ${fontFamily === 'Verdana' ? 'selected' : ''}>Verdana (sans-serif)</option>
                </select>
            </div>
            <div class="property-group">
                <h4>Font Style</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <label>
                        Size:
                        <input type="number" id="fontSize" value="${parseInt(fontSize)}" min="8" max="72" step="1" onchange="Tools.applyText()">
                    </label>
                    <label>
                        Weight:
                        <select id="fontWeight" onchange="Tools.applyText()">
                            <option value="normal" ${fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="bold" ${fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                            <option value="300" ${fontWeight === '300' ? 'selected' : ''}>Light</option>
                            <option value="500" ${fontWeight === '500' ? 'selected' : ''}>Medium</option>
                        </select>
                    </label>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                    <label>
                        Style:
                        <select id="fontStyle" onchange="Tools.applyText()">
                            <option value="normal" ${fontStyle === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="italic" ${fontStyle === 'italic' ? 'selected' : ''}>Italic</option>
                            <option value="oblique" ${fontStyle === 'oblique' ? 'selected' : ''}>Oblique</option>
                        </select>
                    </label>
                    <label>
                        Anchor:
                        <select id="textAnchor" onchange="Tools.applyText()">
                            <option value="start" ${textAnchor === 'start' ? 'selected' : ''}>Left</option>
                            <option value="middle" ${textAnchor === 'middle' ? 'selected' : ''}>Center</option>
                            <option value="end" ${textAnchor === 'end' ? 'selected' : ''}>Right</option>
                        </select>
                    </label>
                </div>
            </div>
            <div class="property-group">
                <h4>Color</h4>
                <label>
                    <span>Fill:</span>
                    <input type="color" id="fontColor" value="${fill}" onchange="Tools.applyText()">
                    <span class="color-hex">${fill}</span>
                </label>
            </div>
        `;

        // Focus text input to encourage direct editing in SVG Editor
        setTimeout(() => {
            const textInput = document.getElementById('fontText');
            if (textInput) {
                textInput.focus();
                textInput.select();
            }
        }, 100);
    },

    // Update element attributes with real-time sync
    updateElementAttribute(attr, value) {
        if (!this.activeElement || this.isUpdating) return;
        
        this.isUpdating = true;
        
        if (attr === 'tag') {
            // Changing tag is complex, maybe warn user
            Toast.info('Tag cannot be changed directly');
        } else if (attr === 'id') {
            this.activeElement.id = value;
        } else {
            this.activeElement.setAttribute(attr, value);
        }
        
        this.updateEditor();
        Preview.showSelectionAnts(this.activeElement);
        
        this.isUpdating = false;
    },

    // Preview transform changes in real-time
    previewTransform() {
        if (!this.activeElement || this.isUpdating) return;
        
        this.isUpdating = true;
        
        const x = document.getElementById('transformX')?.value;
        const y = document.getElementById('transformY')?.value;
        const width = document.getElementById('transformWidth')?.value;
        const height = document.getElementById('transformHeight')?.value;
        const rotate = document.getElementById('transformRotate')?.value;
        
        if (x !== undefined) this.activeElement.setAttribute('x', x);
        if (y !== undefined) this.activeElement.setAttribute('y', y);
        if (width !== undefined) this.activeElement.setAttribute('width', width);
        if (height !== undefined) this.activeElement.setAttribute('height', height);
        if (rotate !== undefined && rotate != 0) {
            this.activeElement.setAttribute('transform', `rotate(${rotate})`);
        }
        
        Preview.showSelectionAnts(this.activeElement);
        
        this.isUpdating = false;
    },

    applyTransform() {
        if (!this.activeElement) return;
        this.previewTransform();
        this.updateEditor();
        Toast.success('Transform applied');
    },

    applyShape() {
        if (!this.activeElement) return;
        
        this.isUpdating = true;
        
        const tag = this.activeElement.tagName.toLowerCase();
        
        if (tag === 'circle') {
            const cx = document.getElementById('shapeCx')?.value;
            const cy = document.getElementById('shapeCy')?.value;
            const r = document.getElementById('shapeR')?.value;
            if (cx) this.activeElement.setAttribute('cx', cx);
            if (cy) this.activeElement.setAttribute('cy', cy);
            if (r) this.activeElement.setAttribute('r', r);
        } else if (tag === 'rect') {
            const x = document.getElementById('shapeX')?.value;
            const y = document.getElementById('shapeY')?.value;
            const width = document.getElementById('shapeWidth')?.value;
            const height = document.getElementById('shapeHeight')?.value;
            const rx = document.getElementById('shapeRx')?.value;
            const ry = document.getElementById('shapeRy')?.value;
            if (x) this.activeElement.setAttribute('x', x);
            if (y) this.activeElement.setAttribute('y', y);
            if (width) this.activeElement.setAttribute('width', width);
            if (height) this.activeElement.setAttribute('height', height);
            if (rx) this.activeElement.setAttribute('rx', rx);
            if (ry) this.activeElement.setAttribute('ry', ry);
        } else if (tag === 'path') {
            const d = document.getElementById('shapePath')?.value;
            if (d) this.activeElement.setAttribute('d', d);
        }
        
        const fill = document.getElementById('shapeFill')?.value;
        const stroke = document.getElementById('shapeStroke')?.value;
        if (fill) this.activeElement.setAttribute('fill', fill);
        if (stroke) this.activeElement.setAttribute('stroke', stroke);
        
        Preview.showSelectionAnts(this.activeElement);
        this.updateEditor();
        
        this.isUpdating = false;
        Toast.success('Shape updated');
    },

    applyText() {
        if (!this.activeElement || this.activeElement.tagName.toLowerCase() !== 'text') return;
        
        this.isUpdating = true;
        
        const fontFamily = document.getElementById('fontFamily')?.value;
        const fontSize = document.getElementById('fontSize')?.value;
        const fontWeight = document.getElementById('fontWeight')?.value;
        const fontStyle = document.getElementById('fontStyle')?.value;
        const textAnchor = document.getElementById('textAnchor')?.value;
        const fontColor = document.getElementById('fontColor')?.value;
        const fontText = document.getElementById('fontText')?.value;
        
        if (fontFamily) this.activeElement.setAttribute('font-family', fontFamily);
        if (fontSize) this.activeElement.setAttribute('font-size', fontSize + 'px');
        if (fontWeight) this.activeElement.setAttribute('font-weight', fontWeight);
        if (fontStyle) this.activeElement.setAttribute('font-style', fontStyle);
        if (textAnchor) this.activeElement.setAttribute('text-anchor', textAnchor);
        if (fontColor) this.activeElement.setAttribute('fill', fontColor);
        if (fontText) this.activeElement.textContent = fontText;
        
        Preview.showSelectionAnts(this.activeElement);
        this.updateEditor();
        
        this.isUpdating = false;
        Toast.success('Text updated');
    },

    scrollToElementInEditor(elementId) {
        const editor = document.getElementById('editor');
        const code = editor.value;
        const elementIndex = code.indexOf(`id="${elementId}"`);
        
        if (elementIndex !== -1) {
            let start = elementIndex;
            while (start > 0 && code[start] !== '<') start--;
            
            let end = code.indexOf('>', elementIndex) + 1;
            
            if (end > start) {
                editor.focus();
                editor.setSelectionRange(start, end);
                
                const linesBefore = code.substring(0, start).split('\n').length - 1;
                const lineHeight = parseInt(getComputedStyle(editor).lineHeight);
                editor.scrollTop = linesBefore * lineHeight - 100;
                
                // Highlight the selection
                this.highlightEditorSelection(start, end);
            }
        }
    },

    highlightEditorSelection(start, end) {
        // Could add visual highlight in editor
        // For now, just selection is enough
    },

    updateEditor() {
        const preview = document.getElementById('preview');
        if (preview && preview.firstChild) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(preview.firstChild);
            
            this.isUpdating = true;
            Editor.setValue(svgString);
            this.isUpdating = false;
        }
    }
};
