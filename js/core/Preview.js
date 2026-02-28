// Preview.js

const Preview = {
    element: document.getElementById('preview'),
    container: document.querySelector('.preview-container'),
    zoomLevel: 100,
    selectedId: null,
    elements: [],
    elementData: {},
    
    init() {
        document.getElementById('previewContainer').addEventListener('click', (e) => {
            if (e.target === e.currentTarget || e.target.id === 'preview') {
                this.clearSelection();
                return;
            }
            
            let element = e.target;
            while (element && element.parentElement && element.parentElement.id !== 'preview') {
                element = element.parentElement;
            }
            
            if (element && element.id && element !== this.element) {
                e.stopPropagation();
                this.selectElement(element.id);
                Tools.handleElementSelect(element.id);
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
        App.updateObjectInfo(id);
        
        if (id) {
            const element = this.element.querySelector(`#${CSS.escape(id)}`);
            this.highlightElement(element);
        } else {
            this.clearSelection();
        }
    },

    highlightElement(element) {
        if (!element) return;
        
        const overlay = document.getElementById('selectionOverlay');
        const info = document.getElementById('selectionInfo');
        
        const pos = Utils.getElementPosition(element, this.container);
        
        overlay.style.left = pos.left + 'px';
        overlay.style.top = pos.top + 'px';
        overlay.style.width = pos.width + 'px';
        overlay.style.height = pos.height + 'px';
        overlay.classList.add('active');
        
        info.style.left = (pos.left + pos.width - 5) + 'px';
        info.style.top = (pos.top + 5) + 'px';
        info.textContent = `${element.tagName} #${element.id}`;
        info.classList.add('active');
    },

    clearSelection() {
        document.getElementById('selectionOverlay').classList.remove('active');
        document.getElementById('selectionInfo').classList.remove('active');
        this.selectedId = null;
        App.updateObjectInfo(null);
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
