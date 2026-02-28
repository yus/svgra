// Tools.js

const Tools = {
    currentTool: 'select',
    toolsPanel: document.getElementById('toolsPanel'),
    
    tools: [
        {
            id: 'selectTool',
            name: 'Selector',
            icon: 'mouse-pointer-2',
            description: 'Select and manipulate elements',
            color: '#2d4c6c'
        },
        {
            id: 'transformTool',
            name: 'Transform',
            icon: 'move',
            description: 'Move, scale, rotate elements',
            color: '#4a6a8c'
        },
        {
            id: 'shapeTool',
            name: 'Shaper',
            icon: 'pen-tool',
            description: 'Draw and modify shapes',
            color: '#6a8cac'
        },
        {
            id: 'textTool',
            name: 'Type',
            icon: 'type',
            description: 'Add and edit text with fonts',
            color: '#8caccc'
        }
    ],

    init() {
        this.render();
        this.setActive('selectTool');
        this.setupGlobalListeners();
    },

    render() {
        if (!this.toolsPanel) return;
        this.toolsPanel.innerHTML = '';
        
        this.tools.forEach(tool => {
            const button = document.createElement('button');
            button.id = tool.id;
            button.className = 'tool-btn';
            button.title = tool.description;
            button.setAttribute('data-tool', tool.id);
            button.innerHTML = `
                <i data-lucide="${tool.icon}" class="icon" style="color: ${tool.color}"></i>
                <span>${tool.name}</span>
            `;
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setActive(tool.id);
            });
            
            this.toolsPanel.appendChild(button);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    setupGlobalListeners() {
        // Listen for element selection from preview
        document.addEventListener('elementSelected', (e) => {
            this.handleElementSelect(e.detail.elementId);
        });
    },

    setActive(toolId) {
        this.currentTool = toolId;
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === toolId);
        });
        
        Toast.info(`${this.getToolName(toolId)} tool activated`);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('toolChanged', { 
            detail: { tool: toolId } 
        }));
    },

    getToolName(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        return tool ? tool.name : 'Unknown';
    },

    handleElementSelect(elementId) {
        if (!elementId) return;
        
        const preview = document.getElementById('preview');
        if (!preview) return;
        
        const element = preview.querySelector(`#${CSS.escape(elementId)}`);
        if (!element) return;
        
        // Execute current tool action
        switch (this.currentTool) {
            case 'selectTool':
                this.handleSelect(element);
                break;
            case 'transformTool':
                this.handleTransform(element);
                break;
            case 'shapeTool':
                this.handleShape(element);
                break;
            case 'textTool':
                this.handleText(element);
                break;
        }
    },

    handleSelect(element) {
        const tag = element.tagName;
        const id = element.id;
        const classes = element.getAttribute('class') || '';
        const attributes = this.getElementAttributes(element);
        
        // Show detailed info in a nice tooltip
        const info = `
            ${tag}#${id}${classes ? '.' + classes.replace(/ /g, '.') : ''}
            ${attributes.length} attributes
        `;
        
        Toast.info(info);
        
        // Log full details to console for debugging
        console.log('Selected element:', {
            tag,
            id,
            classes,
            attributes: this.getElementAttributes(element),
            bbox: element.getBBox ? element.getBBox() : null
        });
    },

    handleTransform(element) {
        const bbox = element.getBBox ? element.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
        
        Toast.info(`Transform: ${Math.round(bbox.width)}×${Math.round(bbox.height)}`);
        
        // Show transform controls
        this.showTransformControls(element, bbox);
    },

    handleShape(element) {
        const tag = element.tagName.toLowerCase();
        const attributes = this.getElementAttributes(element);
        
        Toast.info(`Editing shape: ${tag} (${attributes.length} properties)`);
        
        // Show shape controls
        this.showShapeControls(element, tag);
    },

    handleText(element) {
        if (element.tagName.toLowerCase() !== 'text') {
            Toast.error('Selected element is not text');
            return;
        }
        
        const content = element.textContent;
        const fontSize = element.getAttribute('font-size') || '16';
        const fontFamily = element.getAttribute('font-family') || 'Arial';
        const fontWeight = element.getAttribute('font-weight') || 'normal';
        
        Toast.info(`Text: "${content.substring(0, 20)}${content.length > 20 ? '...' : ''}"`);
        
        // Show font selector
        this.showFontSelector(element, { fontSize, fontFamily, fontWeight });
    },

    getElementAttributes(element) {
        const attrs = [];
        for (let attr of element.attributes) {
            attrs.push({
                name: attr.name,
                value: attr.value
            });
        }
        return attrs;
    },

    showTransformControls(element, bbox) {
        // Remove any existing controls
        const existing = document.querySelector('.transform-controls');
        if (existing) existing.remove();
        
        // Create transform controls
        const controls = document.createElement('div');
        controls.className = 'transform-controls tool-popup';
        controls.innerHTML = `
            <div style="padding: 10px; background: var(--bg-primary); border: 1px solid var(--border-color); min-width: 200px;">
                <div style="margin-bottom: 8px; font-weight: bold;">Transform</div>
                <div style="display: grid; gap: 4px;">
                    <label>X: <input type="number" id="transformX" value="${Math.round(bbox.x)}" step="1"></label>
                    <label>Y: <input type="number" id="transformY" value="${Math.round(bbox.y)}" step="1"></label>
                    <label>Width: <input type="number" id="transformWidth" value="${Math.round(bbox.width)}" step="1" min="1"></label>
                    <label>Height: <input type="number" id="transformHeight" value="${Math.round(bbox.height)}" step="1" min="1"></label>
                    <label>Rotate: <input type="number" id="transformRotate" value="0" step="15"></label>
                </div>
                <div style="display: flex; gap: 4px; margin-top: 8px;">
                    <button class="btn" onclick="Tools.applyTransform('${element.id}')">Apply</button>
                    <button class="btn" onclick="Tools.cancelControls()">Cancel</button>
                </div>
            </div>
        `;
        
        // Position near element
        const pos = Utils.getElementPosition(element, document.querySelector('.preview-container'));
        controls.style.position = 'absolute';
        controls.style.left = (pos.left + pos.width + 10) + 'px';
        controls.style.top = pos.top + 'px';
        controls.style.zIndex = '1000';
        
        document.getElementById('previewContainer').appendChild(controls);
    },

    showShapeControls(element, shapeType) {
        // Remove any existing controls
        const existing = document.querySelector('.shape-controls');
        if (existing) existing.remove();
        
        // Create shape-specific controls
        const controls = document.createElement('div');
        controls.className = 'shape-controls tool-popup';
        
        let shapeFields = '';
        if (shapeType === 'circle') {
            const cx = element.getAttribute('cx') || '50';
            const cy = element.getAttribute('cy') || '50';
            const r = element.getAttribute('r') || '40';
            shapeFields = `
                <label>CX: <input type="number" id="shapeCx" value="${cx}" step="1"></label>
                <label>CY: <input type="number" id="shapeCy" value="${cy}" step="1"></label>
                <label>R: <input type="number" id="shapeR" value="${r}" step="1" min="1"></label>
            `;
        } else if (shapeType === 'rect') {
            const x = element.getAttribute('x') || '0';
            const y = element.getAttribute('y') || '0';
            const width = element.getAttribute('width') || '100';
            const height = element.getAttribute('height') || '100';
            shapeFields = `
                <label>X: <input type="number" id="shapeX" value="${x}" step="1"></label>
                <label>Y: <input type="number" id="shapeY" value="${y}" step="1"></label>
                <label>Width: <input type="number" id="shapeWidth" value="${width}" step="1" min="1"></label>
                <label>Height: <input type="number" id="shapeHeight" value="${height}" step="1" min="1"></label>
            `;
        } else {
            shapeFields = `<div>Advanced editing for ${shapeType} coming soon</div>`;
        }
        
        controls.innerHTML = `
            <div style="padding: 10px; background: var(--bg-primary); border: 1px solid var(--border-color); min-width: 200px;">
                <div style="margin-bottom: 8px; font-weight: bold;">Edit ${shapeType}</div>
                <div style="display: grid; gap: 4px;">
                    ${shapeFields}
                    <label>Fill: <input type="color" id="shapeFill" value="${element.getAttribute('fill') || '#000000'}"></label>
                    <label>Stroke: <input type="color" id="shapeStroke" value="${element.getAttribute('stroke') || '#000000'}"></label>
                </div>
                <div style="display: flex; gap: 4px; margin-top: 8px;">
                    <button class="btn" onclick="Tools.applyShape('${element.id}')">Apply</button>
                    <button class="btn" onclick="Tools.cancelControls()">Cancel</button>
                </div>
            </div>
        `;
        
        // Position near element
        const pos = Utils.getElementPosition(element, document.querySelector('.preview-container'));
        controls.style.position = 'absolute';
        controls.style.left = (pos.left + pos.width + 10) + 'px';
        controls.style.top = pos.top + 'px';
        controls.style.zIndex = '1000';
        
        document.getElementById('previewContainer').appendChild(controls);
    },

    showFontSelector(element, current) {
        // Remove any existing controls
        const existing = document.querySelector('.font-controls');
        if (existing) existing.remove();
        
        // Create font controls
        const controls = document.createElement('div');
        controls.className = 'font-controls tool-popup';
        controls.innerHTML = `
            <div style="padding: 10px; background: var(--bg-primary); border: 1px solid var(--border-color); min-width: 200px;">
                <div style="margin-bottom: 8px; font-weight: bold;">Text Properties</div>
                <div style="display: grid; gap: 4px;">
                    <label>Font:
                        <select id="fontFamily">
                            <option value="Arial" ${current.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                            <option value="Helvetica" ${current.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                            <option value="Times New Roman" ${current.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                            <option value="Courier New" ${current.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                            <option value="Georgia" ${current.fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
                            <option value="Verdana" ${current.fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
                        </select>
                    </label>
                    <label>Size: <input type="number" id="fontSize" value="${parseInt(current.fontSize)}" min="8" max="72" step="1"></label>
                    <label>Weight:
                        <select id="fontWeight">
                            <option value="normal" ${current.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="bold" ${current.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                            <option value="300" ${current.fontWeight === '300' ? 'selected' : ''}>Light</option>
                            <option value="500" ${current.fontWeight === '500' ? 'selected' : ''}>Medium</option>
                        </select>
                    </label>
                    <label>Color: <input type="color" id="fontColor" value="${element.getAttribute('fill') || '#000000'}"></label>
                    <label>Text: <input type="text" id="fontText" value="${element.textContent}"></label>
                </div>
                <div style="display: flex; gap: 4px; margin-top: 8px;">
                    <button class="btn" onclick="Tools.applyFont('${element.id}')">Apply</button>
                    <button class="btn" onclick="Tools.cancelControls()">Cancel</button>
                </div>
            </div>
        `;
        
        // Position near element
        const pos = Utils.getElementPosition(element, document.querySelector('.preview-container'));
        controls.style.position = 'absolute';
        controls.style.left = (pos.left + pos.width + 10) + 'px';
        controls.style.top = pos.top + 'px';
        controls.style.zIndex = '1000';
        
        document.getElementById('previewContainer').appendChild(controls);
    },

    applyTransform(elementId) {
        const element = document.getElementById('preview').querySelector(`#${CSS.escape(elementId)}`);
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
        
        // Update editor content
        this.updateEditorFromPreview();
        Toast.success('Transform applied');
        this.cancelControls();
    },

    applyShape(elementId) {
        const element = document.getElementById('preview').querySelector(`#${CSS.escape(elementId)}`);
        if (!element) return;
        
        const fill = document.getElementById('shapeFill')?.value;
        const stroke = document.getElementById('shapeStroke')?.value;
        
        if (fill) element.setAttribute('fill', fill);
        if (stroke) element.setAttribute('stroke', stroke);
        
        // Shape-specific attributes
        const shapeType = element.tagName.toLowerCase();
        if (shapeType === 'circle') {
            const cx = document.getElementById('shapeCx')?.value;
            const cy = document.getElementById('shapeCy')?.value;
            const r = document.getElementById('shapeR')?.value;
            if (cx) element.setAttribute('cx', cx);
            if (cy) element.setAttribute('cy', cy);
            if (r) element.setAttribute('r', r);
        } else if (shapeType === 'rect') {
            const x = document.getElementById('shapeX')?.value;
            const y = document.getElementById('shapeY')?.value;
            const width = document.getElementById('shapeWidth')?.value;
            const height = document.getElementById('shapeHeight')?.value;
            if (x) element.setAttribute('x', x);
            if (y) element.setAttribute('y', y);
            if (width) element.setAttribute('width', width);
            if (height) element.setAttribute('height', height);
        }
        
        this.updateEditorFromPreview();
        Toast.success('Shape updated');
        this.cancelControls();
    },

    applyFont(elementId) {
        const element = document.getElementById('preview').querySelector(`#${CSS.escape(elementId)}`);
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
        
        this.updateEditorFromPreview();
        Toast.success(`Font updated: ${fontFamily}, ${fontSize}px`);
        this.cancelControls();
    },

    updateEditorFromPreview() {
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
    }
};
