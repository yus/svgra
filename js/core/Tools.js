// Tools.js

const Tools = {
    currentTool: 'select',
    toolsPanel: document.getElementById('toolsPanel'),
    activeElement: null,
    preferencePane: null,
    
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
            tooltip: 'Move, scale, rotate (T)',
            shortcut: 't'
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
            tooltip: 'Edit text (X)',
            shortcut: 'x'
        }
    ],

    init() {
        this.renderTools();
        this.createPreferencePane();
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
            button.innerHTML = `<i data-lucide="${tool.icon}" class="icon"></i>`;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setActive(tool.id);
            });
            
            this.toolsPanel.appendChild(button);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    createPreferencePane() {
        this.preferencePane = document.createElement('div');
        this.preferencePane.id = 'toolPreferencePane';
        this.preferencePane.className = 'tool-preference-pane';
        this.preferencePane.innerHTML = `
            <div class="pane-header">
                <span id="paneTitle">No selection</span>
                <button class="btn-icon" onclick="Tools.hidePreferencePane()">
                    <i data-lucide="chevron-down" class="icon"></i>
                </button>
            </div>
            <div class="pane-content" id="paneContent"></div>
        `;
        document.body.appendChild(this.preferencePane);
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
                
                // Focus in editor
                this.scrollToElementInEditor(element.id);
            } else {
                this.deselectElement();
            }
        });

        // Editor selection sync
        document.getElementById('editor')?.addEventListener('select', () => {
            // Could sync from editor to preview
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
        
        // Update preview selection with ants
        Preview.selectElement(element.id);
        
        // Update preference pane
        this.showPreferencePane();
        
        // Focus in editor
        this.scrollToElementInEditor(element.id);
    },

    deselectElement() {
        if (this.activeElement) {
            this.activeElement.classList.remove('element-hover');
            this.activeElement = null;
        }
        
        Preview.clearSelection();
        this.hidePreferencePane();
    },

    scrollToElementInEditor(elementId) {
        const editor = document.getElementById('editor');
        const code = editor.value;
        const elementIndex = code.indexOf(`id="${elementId}"`);
        
        if (elementIndex !== -1) {
            // Find the start of the element
            let start = elementIndex;
            while (start > 0 && code[start] !== '<') start--;
            
            // Find the end of the element
            let end = code.indexOf('>', elementIndex) + 1;
            
            if (end > start) {
                editor.focus();
                editor.setSelectionRange(start, end);
                
                // Scroll to element
                const linesBefore = code.substring(0, start).split('\n').length - 1;
                const lineHeight = parseInt(getComputedStyle(editor).lineHeight);
                editor.scrollTop = linesBefore * lineHeight - 100;
            }
        }
    },

    setActive(toolId) {
        this.currentTool = toolId;
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === toolId);
        });
        
        document.getElementById('paneTitle').textContent = 
            this.getToolName(toolId) + (this.activeElement ? ' - Editing' : ' (No selection)');
        
        // Update preference pane content if element is selected
        if (this.activeElement) {
            this.updatePreferencePaneContent();
        }
        
        Toast.info(`${this.getToolName(toolId)} tool activated`);
    },

    getToolName(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        return tool ? tool.name : 'Unknown';
    },

    showPreferencePane() {
        if (!this.preferencePane) return;
        this.updatePreferencePaneContent();
        this.preferencePane.classList.add('active');
    },

    hidePreferencePane() {
        if (this.preferencePane) {
            this.preferencePane.classList.remove('active');
        }
    },

    updatePreferencePaneContent() {
        if (!this.preferencePane || !this.activeElement) return;
        
        const content = document.getElementById('paneContent');
        if (!content) return;
        
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
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        content.innerHTML = `
            <div class="property-group">
                <h4>Element Info</h4>
                <label>Tag: <input type="text" value="${tag}" readonly></label>
                <label>ID: <input type="text" value="${id}" readonly></label>
                <label>Class: <input type="text" value="${classes}" readonly></label>
            </div>
            <div class="property-group">
                <h4>Position</h4>
                <label>X: <input type="number" value="${Math.round(bbox.x)}" readonly></label>
                <label>Y: <input type="number" value="${Math.round(bbox.y)}" readonly></label>
            </div>
            <div class="property-group">
                <h4>Size</h4>
                <label>Width: <input type="number" value="${Math.round(bbox.width)}" readonly></label>
                <label>Height: <input type="number" value="${Math.round(bbox.height)}" readonly></label>
            </div>
        `;
    },

    renderTransformPane(content) {
        const element = this.activeElement;
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        content.innerHTML = `
            <div class="property-group">
                <h4>Position</h4>
                <label>X: <input type="number" id="transformX" value="${Math.round(bbox.x)}" step="1" onchange="Tools.applyTransform()"></label>
                <label>Y: <input type="number" id="transformY" value="${Math.round(bbox.y)}" step="1" onchange="Tools.applyTransform()"></label>
            </div>
            <div class="property-group">
                <h4>Size</h4>
                <label>Width: <input type="number" id="transformWidth" value="${Math.round(bbox.width)}" step="1" min="1" onchange="Tools.applyTransform()"></label>
                <label>Height: <input type="number" id="transformHeight" value="${Math.round(bbox.height)}" step="1" min="1" onchange="Tools.applyTransform()"></label>
            </div>
            <div class="property-group">
                <h4>Rotation</h4>
                <label>Angle: <input type="number" id="transformRotate" value="0" step="15" onchange="Tools.applyTransform()"></label>
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
        
        content.innerHTML = `
            <div class="property-group">
                <h4>Text Content</h4>
                <label>Text: <input type="text" id="fontText" value="${textContent}" onchange="Tools.applyText()"></label>
            </div>
            <div class="property-group">
                <h4>Font</h4>
                <label>
                    Family:
                    <select id="fontFamily" onchange="Tools.applyText()">
                        <option value="Arial" ${fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                        <option value="Helvetica" ${fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                        <option value="Times New Roman" ${fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                        <option value="Courier New" ${fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                        <option value="Georgia" ${fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
                        <option value="Verdana" ${fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
                    </select>
                </label>
                <label>Size: <input type="number" id="fontSize" value="${parseInt(fontSize)}" min="8" max="72" step="1" onchange="Tools.applyText()"></label>
                <label>
                    Weight:
                    <select id="fontWeight" onchange="Tools.applyText()">
                        <option value="normal" ${fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="bold" ${fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                        <option value="300" ${fontWeight === '300' ? 'selected' : ''}>Light</option>
                        <option value="500" ${fontWeight === '500' ? 'selected' : ''}>Medium</option>
                    </select>
                </label>
                <label>Color: <input type="color" id="fontColor" value="${element.getAttribute('fill') || '#000000'}" onchange="Tools.applyText()"></label>
            </div>
        `;
    },

    applyTransform() {
        if (!this.activeElement) return;
        
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
        
        this.updateEditor();
        Preview.showSelectionAnts(this.activeElement);
        Toast.success('Transform applied');
    },

    applyShape() {
        if (!this.activeElement) return;
        
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
        
        this.updateEditor();
        Preview.showSelectionAnts(this.activeElement);
        Toast.success('Shape updated');
    },

    applyText() {
        if (!this.activeElement || this.activeElement.tagName.toLowerCase() !== 'text') return;
        
        const fontFamily = document.getElementById('fontFamily')?.value;
        const fontSize = document.getElementById('fontSize')?.value;
        const fontWeight = document.getElementById('fontWeight')?.value;
        const fontColor = document.getElementById('fontColor')?.value;
        const fontText = document.getElementById('fontText')?.value;
        
        if (fontFamily) this.activeElement.setAttribute('font-family', fontFamily);
        if (fontSize) this.activeElement.setAttribute('font-size', fontSize + 'px');
        if (fontWeight) this.activeElement.setAttribute('font-weight', fontWeight);
        if (fontColor) this.activeElement.setAttribute('fill', fontColor);
        if (fontText) this.activeElement.textContent = fontText;
        
        this.updateEditor();
        Preview.showSelectionAnts(this.activeElement);
        Toast.success('Text updated');
    },

    updateEditor() {
        const preview = document.getElementById('preview');
        if (preview && preview.firstChild) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(preview.firstChild);
            Editor.setValue(svgString);
        }
    }
};
