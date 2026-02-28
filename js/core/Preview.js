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
    dragMode: null,
    originalBBox: null,
    previewLine: null,
    
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
        
        // Create preview line for transforms
        this.previewLine = document.createElement('div');
        this.previewLine.className = 'transform-preview-line';
        this.previewLine.style.display = 'none';
        this.container?.appendChild(this.previewLine);
        
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
                this.dragMode = null;
                if (this.previewLine) this.previewLine.style.display = 'none';
                Tools.updateEditor();
                
                // Update footer after transform
                if (this.selectedId) {
                    this.updateElementData(this.selectedId);
                }
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

    updateElementData(id) {
        if (!id) return;
        const element = this.element.querySelector(`#${CSS.escape(id)}`);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        this.elementData[id] = {
            tag: element.tagName,
            position: { x: rect.x, y: rect.y },
            size: { width: rect.width, height: rect.height }
        };
        
        this.updateFooterInfo(id);
    },

    selectElement(id) {
        this.selectedId = id;
        this.removeTransformHandles();
        
        if (id) {
            const element = this.element.querySelector(`#${CSS.escape(id)}`);
            if (element) {
                this.showSelectionAnts(element);
                this.updateElementData(id);
                
                // Add transform handles if transform tool is active
                if (Tools.currentTool === 'transformTool') {
                    this.addTransformHandles(element);
                }
            }
        } else {
            this.hideSelectionAnts();
        }
        
        this.updateFooterInfo(id);
    },

    updateFooterInfo(id) {
        const selectedObject = document.getElementById('selectedObject');
        const objectPosition = document.getElementById('objectPosition');
        const objectSize = document.getElementById('objectSize');
        
        if (id && this.elementData[id]) {
            const data = this.elementData[id];
            selectedObject.innerHTML = `${data.tag} <span class="readonly-value">#${id}</span>`;
            objectPosition.innerHTML = `<i data-lucide="map-pin" class="icon-sm"></i> <span class="readonly-value">${Math.round(data.position.x)},${Math.round(data.position.y)}</span>`;
            objectSize.innerHTML = `<i data-lucide="maximize-2" class="icon-sm"></i> <span class="readonly-value">${Math.round(data.size.width)}×${Math.round(data.size.height)}</span>`;
        } else {
            selectedObject.innerHTML = 'No selection';
            objectPosition.innerHTML = '';
            objectSize.innerHTML = '';
        }
        
        if (window.lucide) lucide.createIcons();
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
        
        // Corner handles (scale)
        const corners = [
            { x: pos.left, y: pos.top, cursor: 'nw-resize', type: 'corner', action: 'scale' },
            { x: pos.left + pos.width, y: pos.top, cursor: 'ne-resize', type: 'corner', action: 'scale' },
            { x: pos.left, y: pos.top + pos.height, cursor: 'sw-resize', type: 'corner', action: 'scale' },
            { x: pos.left + pos.width, y: pos.top + pos.height, cursor: 'se-resize', type: 'corner', action: 'scale' }
        ];
        
        // Edge handles (scale constrained)
        const edges = [
            { x: pos.left + pos.width / 2, y: pos.top, cursor: 'n-resize', type: 'edge', action: 'scale-y' },
            { x: pos.left + pos.width, y: pos.top + pos.height / 2, cursor: 'e-resize', type: 'edge', action: 'scale-x' },
            { x: pos.left + pos.width / 2, y: pos.top + pos.height, cursor: 's-resize', type: 'edge', action: 'scale-y' },
            { x: pos.left, y: pos.top + pos.height / 2, cursor: 'w-resize', type: 'edge', action: 'scale-x' }
        ];
        
        // Rotation handle (top center)
        const rotateHandle = {
            x: pos.left + pos.width / 2,
            y: pos.top - 20,
            cursor: 'grab',
            type: 'rotate',
            action: 'rotate'
        };
        
        [...corners, ...edges, rotateHandle].forEach((handle, i) => {
            const handleEl = document.createElement('div');
            handleEl.className = `transform-handle ${handle.type}`;
            handleEl.style.left = (handle.x - (handle.type === 'rotate' ? 8 : 7)) + 'px';
            handleEl.style.top = (handle.y - (handle.type === 'rotate' ? 8 : 7)) + 'px';
            handleEl.style.cursor = handle.cursor;
            handleEl.setAttribute('data-handle', i);
            handleEl.setAttribute('data-handle-type', handle.type);
            handleEl.setAttribute('data-handle-action', handle.action || 'move');
            
            handleEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startTransform(element, handle, e);
            });
            
            this.container.appendChild(handleEl);
            this.transformHandles.push(handleEl);
        });
    },

    removeTransformHandles() {
        this.transformHandles.forEach(handle => handle.remove());
        this.transformHandles = [];
    },

    getElementAttributes(element) {
        const tag = element.tagName.toLowerCase();
        const attrs = {};
        
        // Get common attributes
        for (let attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        
        // Get position based on element type
        if (tag === 'circle') {
            attrs.cx = parseFloat(element.getAttribute('cx') || '0');
            attrs.cy = parseFloat(element.getAttribute('cy') || '0');
            attrs.r = parseFloat(element.getAttribute('r') || '0');
        } else if (tag === 'rect' || tag === 'text') {
            attrs.x = parseFloat(element.getAttribute('x') || '0');
            attrs.y = parseFloat(element.getAttribute('y') || '0');
            attrs.width = parseFloat(element.getAttribute('width') || '0');
            attrs.height = parseFloat(element.getAttribute('height') || '0');
        } else if (tag === 'polygon' || tag === 'polyline') {
            // For polygons, we'll use transform for now
            attrs.points = element.getAttribute('points') || '';
        }
        
        // Get transform if exists
        const transform = element.getAttribute('transform');
        if (transform) {
            const match = transform.match(/rotate\(([^)]+)\)/);
            if (match) {
                attrs.rotate = parseFloat(match[1]);
            }
        }
        
        return attrs;
    },

    setElementAttributes(element, attrs) {
        const tag = element.tagName.toLowerCase();
        
        for (let [key, value] of Object.entries(attrs)) {
            if (key === 'rotate') {
                if (value) {
                    element.setAttribute('transform', `rotate(${value})`);
                } else {
                    element.removeAttribute('transform');
                }
            } else if (key !== 'tag' && value !== undefined) {
                element.setAttribute(key, value);
            }
        }
    },

    startTransform(element, handle, e) {
        this.isDragging = true;
        this.dragStart = {
            x: e.clientX,
            y: e.clientY,
            handle: handle,
            originalAttrs: this.getElementAttributes(element)
        };
        this.dragMode = handle.action || 'move';
        this.originalBBox = element.getBBox();
        
        element.classList.add('element-hover');
        
        // Show preview line for rotation
        if (this.dragMode === 'rotate' && this.previewLine) {
            const pos = Utils.getElementPosition(element, this.container);
            this.previewLine.style.display = 'block';
            this.previewLine.style.left = pos.left + pos.width/2 + 'px';
            this.previewLine.style.top = pos.top + pos.height/2 + 'px';
            this.previewLine.style.width = '1px';
            this.previewLine.style.height = '100px';
            this.previewLine.style.transformOrigin = 'top';
        }
    },

    handleDrag(e) {
        if (!this.isDragging || !this.selectedId || !this.dragStart) return;
        
        const element = this.element.querySelector(`#${CSS.escape(this.selectedId)}`);
        if (!element) return;
        
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        const tag = element.tagName.toLowerCase();
        
        switch (this.dragMode) {
            case 'move':
                this.handleMove(element, tag, dx, dy);
                break;
            case 'scale':
            case 'scale-x':
            case 'scale-y':
                this.handleScale(element, tag, dx, dy);
                break;
            case 'rotate':
                this.handleRotate(element, dx, dy);
                break;
        }
        
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
        
        this.showSelectionAnts(element);
        this.removeTransformHandles();
        this.addTransformHandles(element);
        this.updateElementData(this.selectedId);
    },

    handleMove(element, tag, dx, dy) {
        if (tag === 'circle') {
            const cx = parseFloat(element.getAttribute('cx') || '0') + dx;
            const cy = parseFloat(element.getAttribute('cy') || '0') + dy;
            element.setAttribute('cx', cx);
            element.setAttribute('cy', cy);
        } else if (tag === 'rect' || tag === 'text') {
            const x = parseFloat(element.getAttribute('x') || '0') + dx;
            const y = parseFloat(element.getAttribute('y') || '0') + dy;
            element.setAttribute('x', x);
            element.setAttribute('y', y);
        } else if (tag === 'polygon' || tag === 'polyline') {
            // For polygons, use transform translate as a simpler approach
            const currentTransform = element.getAttribute('transform') || '';
            const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
            let tx = 0, ty = 0;
            
            if (translateMatch) {
                const parts = translateMatch[1].split(',').map(parseFloat);
                tx = parts[0] || 0;
                ty = parts[1] || 0;
            }
            
            tx += dx;
            ty += dy;
            
            // Remove old translate and add new one
            const newTransform = currentTransform.replace(/translate\([^)]+\)/, '').trim();
            element.setAttribute('transform', `translate(${tx},${ty}) ${newTransform}`.trim());
        }
    },

    handleScale(element, tag, dx, dy) {
        const scaleX = 1 + dx / 100;
        const scaleY = 1 + dy / 100;
        
        if (tag === 'circle') {
            const r = parseFloat(element.getAttribute('r') || '40');
            const scale = Math.max(0.1, this.dragMode === 'scale-x' ? scaleX : 
                                        this.dragMode === 'scale-y' ? scaleY : 
                                        Math.min(scaleX, scaleY));
            element.setAttribute('r', r * scale);
        } else if (tag === 'rect' || tag === 'text') {
            const width = parseFloat(element.getAttribute('width') || '100');
            const height = parseFloat(element.getAttribute('height') || '100');
            
            if (this.dragMode === 'scale-x' || this.dragMode === 'scale') {
                element.setAttribute('width', Math.max(1, width * (1 + dx / 100)));
            }
            if (this.dragMode === 'scale-y' || this.dragMode === 'scale') {
                element.setAttribute('height', Math.max(1, height * (1 + dy / 100)));
            }
        }
    },

    handleRotate(element, dx, dy) {
        const center = {
            x: parseFloat(element.getAttribute('x') || element.getAttribute('cx') || '50'),
            y: parseFloat(element.getAttribute('y') || element.getAttribute('cy') || '50')
        };
        
        // Calculate rotation angle based on mouse movement
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const currentTransform = element.getAttribute('transform') || '';
        const rotateMatch = currentTransform.match(/rotate\(([^)]+)\)/);
        let currentRotate = 0;
        
        if (rotateMatch) {
            currentRotate = parseFloat(rotateMatch[1]);
        }
        
        const newRotate = currentRotate + angle;
        
        // Remove old rotate and add new one
        const newTransform = currentTransform.replace(/rotate\([^)]+\)/, '').trim();
        element.setAttribute('transform', `rotate(${newRotate}) ${newTransform}`.trim());
        
        // Update preview line
        if (this.previewLine) {
            const pos = Utils.getElementPosition(element, this.container);
            this.previewLine.style.transform = `rotate(${newRotate}deg)`;
        }
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
