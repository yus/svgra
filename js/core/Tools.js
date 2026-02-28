// Tools.js

const Tools = {
    currentTool: 'select',
    toolsPanel: document.getElementById('toolsPanel'),
    
    tools: [
        {
            id: 'selectTool',
            name: 'Selector',
            icon: 'mouse-pointer-2',
            description: 'Select and manipulate elements'
        },
        {
            id: 'transformTool',
            name: 'Transform',
            icon: 'move',
            description: 'Move, scale, rotate elements'
        },
        {
            id: 'shapeTool',
            name: 'Shaper',
            icon: 'pen-tool',
            description: 'Draw and modify shapes'
        },
        {
            id: 'textTool',
            name: 'Type',
            icon: 'type',
            description: 'Add and edit text with fonts'
        }
    ],

    init() {
        this.render();
        this.setActive('selectTool');
    },

    render() {
        this.toolsPanel.innerHTML = '';
        
        this.tools.forEach(tool => {
            const button = document.createElement('button');
            button.id = tool.id;
            button.className = 'tool-btn';
            button.title = tool.description;
            button.innerHTML = `
                <i data-lucide="${tool.icon}" class="icon"></i>
                <span>${tool.name}</span>
            `;
            
            button.addEventListener('click', () => this.setActive(tool.id));
            this.toolsPanel.appendChild(button);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    setActive(toolId) {
        this.currentTool = toolId;
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === toolId);
        });
        
        Toast.info(`${this.getToolName(toolId)} tool activated`);
    },

    getToolName(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        return tool ? tool.name : 'Unknown';
    },

    handleElementSelect(elementId) {
        if (!elementId) return;
        
        const element = document.getElementById('preview').querySelector(`#${CSS.escape(elementId)}`);
        if (!element) return;
        
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
        // Show element properties
        const tag = element.tagName;
        const id = element.id;
        const classes = element.className;
        
        Toast.info(`Selected: ${tag}#${id} ${classes ? '.' + classes : ''}`);
    },

    handleTransform(element) {
        // Show transform controls
        const bbox = element.getBBox();
        Toast.info(`Transform: ${Math.round(bbox.width)}×${Math.round(bbox.height)}`);
        
        // Here you would add transform handles
        this.showTransformHandles(element);
    },

    handleShape(element) {
        // Show shape editing controls
        const tag = element.tagName.toLowerCase();
        Toast.info(`Editing shape: ${tag}`);
        
        // Here you would add shape editing controls
        this.showShapeControls(element);
    },

    handleText(element) {
        if (element.tagName.toLowerCase() !== 'text') {
            Toast.error('Selected element is not text');
            return;
        }
        
        // Show text editing controls
        const content = element.textContent;
        const fontSize = element.getAttribute('font-size') || '16';
        const fontFamily = element.getAttribute('font-family') || 'Arial';
        
        Toast.info(`Text: "${content}" (${fontSize}px, ${fontFamily})`);
        
        // Show font selector
        this.showFontSelector(element);
    },

    showTransformHandles(element) {
        // Placeholder for transform handles
        console.log('Show transform handles for:', element.id);
    },

    showShapeControls(element) {
        // Placeholder for shape controls
        console.log('Show shape controls for:', element.id);
    },

    showFontSelector(element) {
        // Create temporary font selector
        const selector = document.createElement('div');
        selector.className = 'tool-popup';
        selector.innerHTML = `
            <div style="padding: 10px; background: var(--bg-primary); border: 1px solid var(--border-color);">
                <select id="fontFamily" style="margin-bottom: 5px;">
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                </select>
                <input type="number" id="fontSize" value="16" min="8" max="72" style="width: 60px;">
                <button class="btn" onclick="Tools.applyFont('${element.id}')">Apply</button>
            </div>
        `;
        
        // Position near element
        const pos = Utils.getElementPosition(element, document.querySelector('.preview-container'));
        selector.style.position = 'absolute';
        selector.style.left = pos.left + 'px';
        selector.style.top = (pos.top - 50) + 'px';
        selector.style.zIndex = '1000';
        
        document.getElementById('previewContainer').appendChild(selector);
        
        setTimeout(() => {
            if (selector.parentNode) selector.remove();
        }, 5000);
    },

    applyFont(elementId) {
        const element = document.getElementById('preview').querySelector(`#${CSS.escape(elementId)}`);
        if (!element) return;
        
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = document.getElementById('fontSize').value;
        
        element.setAttribute('font-family', fontFamily);
        element.setAttribute('font-size', fontSize);
        
        Toast.success(`Font updated: ${fontFamily}, ${fontSize}px`);
    }
};
