// Preview.js with Transform handles

const Preview = {
    element: document.getElementById('preview'),
    container: document.querySelector('.workspace-area'),
    zoomLevel: 100,
    selectedId: null,
    elements: [],
    elementData: {},
    selectionAnts: null,
    transformHandles: [],
    isDragging: false,
    dragStart: null,
    
    init() {
        if (!this.container) {
            this.container = document.querySelector('.workspace-area');
        }
        
        // Create selection ants element
        this.selectionAnts = document.getElementById('selectionAnts');
        if (!this.selectionAnts) {
            this.selectionAnts = document.createElement('div');
            this.selectionAnts.id = 'selectionAnts';
            this.selectionAnts.className = 'selection-ants';
            this.selectionAnts.style.display = 'none';
            this.container?.appendChild(this.selectionAnts);
        }
        
        this.setupTransformHandlers();
    },

    setupTransformHandlers() {
        // Mouse move for transform handles
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.selectedId) {
                this.handleDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.dragStart = null;
                Tools.updateEditor();
            }
        });
    },

    update(svgString) {
        try {
            const currentSelection = this.selectedId;
            
            this.element.innerHTML = '';
            
            const svgDoc = Utils.parseSVG(svgString);
            const svgElement = Utils.validateSVG(svgDoc);
            const cleanSvg = Utils.cleanSVG(svgElement);
            
            this.element.appendChild(cleanSvg);
            this.extractElements();
            
            App.updateElementCount(this.elements.length);
            
            if (currentSelection && this.elements.find(e => e.id === currentSelection)) {
                this.selectElement(currentSelection);
            }
            
            this.applyZoom();
            App.updateGrid();
            App.updateViewBox();
            
        } catch (error) {
            this.element.innerHTML = `<div style="color: var(--error-color); padding: 20px; font-family: monospace;">Error: ${error.message}</div>`;
            console.error('Preview error:', error);
        }
    },

    extractElements() {
        this.elements = [];
        this.elementData = {};
        
        if (!this.element.firstChild || this.element.firstChild.tagName !== 'svg') return;
        
        const svgElement = this.element.firstChild;
        const allElements = svgElement.querySelectorAll('*');
        
        allElements.forEach((element) => {
            if (element.id) {
                const rect = element.getBoundingClientRect();
                const tag = element.tagName;
                
                this.elements.push({
                    id: element.id,
                    tag: tag,
                    label: `${tag}#${element.id}`
                });
                
                this.elementData[element.id] = {
                    tag: tag,
                    position: { x: rect.x, y: rect.y },
                    size: { width: rect.width, height: rect.height }
                };
            }
        });
    },

    selectElement(id) {
        this.selectedId = id;
        this.removeTransformHandles();
        
        if (id) {
            const element = this.element.querySelector(`#${CSS.escape(id)}`);
            if (element) {
                this.showSelectionAnts(element);
                
                // Add transform handles if transform tool is active
                if (Tools.currentTool === 'transformTool') {
                    this.addTransformHandles(element);
                }
            }
        } else {
            this.hideSelectionAnts();
        }
        
        // Update footer with readonly info
        this.updateFooterInfo(id);
    },

    updateFooterInfo(id) {
        const selectedObject = document.getElementById('selectedObject');
        const objectPosition = document.getElementById('objectPosition');
        const objectSize = document.getElementById('objectSize');
        
        if (id && this.elementData[id]) {
            const data = this.elementData[id];
            selectedObject.innerHTML = `${data.tag} <span class="readonly-value">#${id}</span>`;
            objectPosition.innerHTML = `📍 <span class="readonly-value">${Math.round(data.position.x)},${Math.round(data.position.y)}</span>`;
            objectSize.innerHTML = `📐 <span class="readonly-value">${Math.round(data.size.width)}×${Math.round(data.size.height)}</span>`;
        } else {
            selectedObject.innerHTML = 'No selection';
            objectPosition.innerHTML = '';
            objectSize.innerHTML = '';
        }
    },

    showSelectionAnts(element) {
        if (!this.selectionAnts || !this.container || !element) return;
        
        const pos = Utils.getElementPosition(element, this.container);
        
        this.selectionAnts.style.display = 'block';
        this.selectionAnts.style.left = pos.left + 'px';
        this.selectionAnts.style.top = pos.top + 'px';
        this.selectionAnts.style.width = pos.width + 'px';
        this.selectionAnts.style.height = pos.height + 'px';
    },

    hideSelectionAnts() {
        if (this.selectionAnts) {
            this.selectionAnts.style.display = 'none';
        }
        this.removeTransformHandles();
    },

    addTransformHandles(element) {
        this.removeTransformHandles();
        
        const pos = Utils.getElementPosition(element, this.container);
        
        // Corner handles
        const corners = [
            { x: pos.left, y: pos.top, cursor: 'nw-resize', type: 'corner' },
            { x: pos.left + pos.width, y: pos.top, cursor: 'ne-resize', type: 'corner' },
            { x: pos.left, y: pos.top + pos.height, cursor: 'sw-resize', type: 'corner' },
            { x: pos.left + pos.width, y: pos.top + pos.height, cursor: 'se-resize', type: 'corner' }
        ];
        
        // Edge handles
        const edges = [
            { x: pos.left + pos.width / 2, y: pos.top, cursor: 'n-resize', type: 'edge' },
            { x: pos.left + pos.width, y: pos.top + pos.height / 2, cursor: 'e-resize', type: 'edge' },
            { x: pos.left + pos.width / 2, y: pos.top + pos.height, cursor: 's-resize', type: 'edge' },
            { x: pos.left, y: pos.top + pos.height / 2, cursor: 'w-resize', type: 'edge' }
        ];
        
        [...corners, ...edges].forEach((pos, i) => {
            const handle = document.createElement('div');
            handle.className = `transform-handle ${pos.type}`;
            handle.style.left = (pos.x - 6) + 'px';
            handle.style.top = (pos.y - 6) + 'px';
            handle.style.cursor = pos.cursor;
            handle.setAttribute('data-handle', i);
            handle.setAttribute('data-handle-type', pos.type);
            
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startTransform(element, i, e);
            });
            
            this.container.appendChild(handle);
            this.transformHandles.push(handle);
        });
    },

    removeTransformHandles() {
        this.transformHandles.forEach(handle => handle.remove());
        this.transformHandles = [];
    },

    startTransform(element, handleIndex, e) {
        this.isDragging = true;
        this.dragStart = {
            x: e.clientX,
            y: e.clientY,
            handleIndex: handleIndex,
            originalAttrs: this.getElementAttributes(element)
        };
        
        element.classList.add('element-hover');
    },

    handleDrag(e) {
        if (!this.isDragging || !this.selectedId || !this.dragStart) return;
        
        const element = this.element.querySelector(`#${CSS.escape(this.selectedId)}`);
        if (!element) return;
        
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        
        // Simple transform - just move for now
        // In a full implementation, you'd handle resize based on handle index
        
        const currentX = parseFloat(element.getAttribute('x') || element.getAttribute('cx') || '0');
        const currentY = parseFloat(element.getAttribute('y') || element.getAttribute('cy') || '0');
        
        if (element.tagName.toLowerCase() === 'circle') {
            element.setAttribute('cx', currentX + dx);
            element.setAttribute('cy', currentY + dy);
        } else {
            element.setAttribute('x', currentX + dx);
            element.setAttribute('y', currentY + dy);
        }
        
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
        
        this.showSelectionAnts(element);
        this.removeTransformHandles();
        this.addTransformHandles(element);
    },

    getElementAttributes(element) {
        const attrs = {};
        for (let attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    },

    clearSelection() {
        this.selectedId = null;
        this.hideSelectionAnts();
        this.updateFooterInfo(null);
    },

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 25, 500);
        this.applyZoom();
    },

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 25, 25);
        this.applyZoom();
    },

    resetZoom() {
        this.zoomLevel = 100;
        this.applyZoom();
        Toast.info('Zoom reset to 100%');
    },

    applyZoom() {
        if (this.element.firstChild) {
            this.element.firstChild.style.transform = `scale(${this.zoomLevel / 100})`;
            this.element.firstChild.style.transformOrigin = 'center center';
            
            const zoomDisplay = document.getElementById('zoomDisplay');
            if (zoomDisplay) zoomDisplay.textContent = `${this.zoomLevel}%`;
        }
    },

    fitToScreen() {
        const svgElement = this.element.firstChild;
        if (!svgElement || svgElement.tagName !== 'svg') return;
        
        const viewBox = Utils.getViewBox(svgElement);
        if (!viewBox) return;
        
        const containerWidth = this.container.clientWidth - 40;
        const containerHeight = this.container.clientHeight - 40;
        
        const scale = Math.min(
            containerWidth / viewBox.width,
            containerHeight / viewBox.height
        ) * 0.9;
        
        this.zoomLevel = Math.round(scale * 100);
        this.applyZoom();
        Toast.success('Fit to screen');
    },

    centerView() {
        if (this.element.firstChild) {
            this.element.firstChild.style.transformOrigin = 'center center';
            this.element.scrollLeft = this.element.scrollWidth / 2 - this.element.clientWidth / 2;
            this.element.scrollTop = this.element.scrollHeight / 2 - this.element.clientHeight / 2;
            Toast.info('View centered');
        }
    }
};
