// Tools.js with focus management

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

    init() {
        this.renderTools();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.hidePreferencePane();
        
        // Set initial tool
        this.setActive('selectTool');
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
                
                // Return focus to SVG Editor
                document.getElementById('editor').focus();
            });
            
            this.toolsPanel.appendChild(button);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    setupEventListeners() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;

        // Hover effect
        previewContainer.addEventListener('mouseover', (e) => {
            const element = Utils.findSVGElement(e.target, previewContainer);
            if (element && element.id && element !== this.activeElement) {
                element.classList.add('element-hover');
            }
        });

        previewContainer.addEventListener('mouseout', (e) => {
            const element = Utils.findSVGElement(e.target, previewContainer);
            if (element) {
                element.classList.remove('element-hover');
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

        // Editor focus management
        const editor = document.getElementById('editor');
        editor.addEventListener('focus', () => {
            // Could highlight corresponding element in preview
        });

        editor.addEventListener('blur', () => {
            // Keep selection but remove focus highlight
        });

        // Preference pane input focus
        document.addEventListener('focusin', (e) => {
            if (e.target.closest('.preference-pane')) {
                // Input in preference pane - update editor silently
            }
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't intercept if typing in editor or inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Allow normal typing, but still handle tool shortcuts with Ctrl
                if (e.ctrlKey) {
                    switch(e.key.toLowerCase()) {
                        case 's': e.preventDefault(); App.saveSVG(); break;
                        case 'z': e.preventDefault(); Editor.undo(); break;
                        case 'y': e.preventDefault(); Editor.redo(); break;
                    }
                }
                return;
            }
            
            const key = e.key.toLowerCase();
            switch(key) {
                case 's': this.setActive('selectTool'); e.preventDefault(); break;
                case 'x': this.setActive('transformTool'); e.preventDefault(); break;
                case 'h': this.setActive('shapeTool'); e.preventDefault(); break;
                case 't': this.setActive('textTool'); e.preventDefault(); break;
                case 'escape': this.deselectElement(); e.preventDefault(); break;
            }
            
            // Return focus to editor after tool change
            document.getElementById('editor').focus();
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
        
        // Update footer info is handled by Preview
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
            
            // Update transform handles if needed
            if (toolId === 'transformTool') {
                Preview.addTransformHandles(this.activeElement);
            } else {
                Preview.removeTransformHandles();
            }
        }
        
        Toast.info(`${this.getToolName(toolId)} tool activated`);
    },

    // ... rest of the tool rendering methods remain the same ...
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

    renderSelectPane(content) {
        const element = this.activeElement;
        const tag = element.tagName;
        const id = element.id;
        const classes = element.getAttribute('class') || '';
        const fill = element.getAttribute('fill') || '#000000';
        const stroke = element.getAttribute('stroke') || 'none';
        
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
        `;
    },

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
                    <input type="range" id="transformRotate" value="0" min="0" max="360" step="15" onchange="Tools.applyTransform()" oninput="Tools.previewTransform(); document.getElementById('transformRotateValue').value = this.value">
                    <input type="number" id="transformRotateValue" value="0" min="0" max="360" step="15" onchange="Tools.applyTransform(); document.getElementById('transformRotate').value = this.value" style="width: 60px; margin-left: 8px;">
                </label>
            </div>
        `;
    },

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
        }
        
        content.innerHTML = shapeHtml + `
            <div class="property-group">
                <h4>Appearance</h4>
                <label>Fill: <input type="color" id="shapeFill" value="${element.getAttribute('fill') || '#000000'}" onchange="Tools.applyShape()"></label>
                <label>Stroke: <input type="color" id="shapeStroke" value="${element.getAttribute('stroke') || '#000000'}" onchange="Tools.applyShape()"></label>
            </div>
        `;
    },

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
                <small style="color: var(--text-tertiary); display: block; margin-top: 4px;">Edit directly in SVG Editor for more control</small>
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
    },

    // Update methods remain the same...
    updateElementAttribute(attr, value) {
        if (!this.activeElement || this.isUpdating) return;
        
        this.isUpdating = true;
        
        if (attr === 'id') {
            this.activeElement.id = value;
        } else if (attr !== 'tag') {
            this.activeElement.setAttribute(attr, value);
        }
        
        this.updateEditor();
        Preview.showSelectionAnts(this.activeElement);
        
        this.isUpdating = false;
    },

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
        Preview.updateFooterInfo(this.activeElement.id);
        
        this.isUpdating = false;
    },

    applyTransform() {
        if (!this.activeElement) return;
        this.previewTransform();
        this.updateEditor();
        Toast.success('Transform applied');
        
        // Return focus to editor
        document.getElementById('editor').focus();
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
        }
        
        const fill = document.getElementById('shapeFill')?.value;
        const stroke = document.getElementById('shapeStroke')?.value;
        if (fill) this.activeElement.setAttribute('fill', fill);
        if (stroke) this.activeElement.setAttribute('stroke', stroke);
        
        Preview.showSelectionAnts(this.activeElement);
        Preview.updateFooterInfo(this.activeElement.id);
        this.updateEditor();
        
        this.isUpdating = false;
        Toast.success('Shape updated');
        
        document.getElementById('editor').focus();
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
        Preview.updateFooterInfo(this.activeElement.id);
        this.updateEditor();
        
        this.isUpdating = false;
        Toast.success('Text updated');
        
        document.getElementById('editor').focus();
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
            }
        }
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
