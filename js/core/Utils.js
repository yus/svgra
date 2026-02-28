// Utils.js

const Utils = {
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    formatXML(xml) {
        const lines = xml.split('\n');
        let indent = 0;
        const formatted = [];
        const indentStr = '  ';
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            
            if (trimmed.startsWith('</')) {
                indent--;
            }
            
            formatted.push(indentStr.repeat(indent) + trimmed);
            
            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                indent++;
            }
        });
        
        return formatted.join('\n');
    },

    minifyXML(xml) {
        return xml
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    },

    generateId(prefix = 'elem') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    getElementPosition(element, container) {
        if (!element || !container) {
            console.warn('getElementPosition: element or container is null');
            return { left: 0, top: 0, width: 0, height: 0 };
        }
        
        try {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            return {
                left: rect.left - containerRect.left + container.scrollLeft,
                top: rect.top - containerRect.top + container.scrollTop,
                width: rect.width,
                height: rect.height
            };
        } catch (error) {
            console.error('Error getting element position:', error);
            return { left: 0, top: 0, width: 0, height: 0 };
        }
    },

    parseSVG(svgString) {
        const parser = new DOMParser();
        return parser.parseFromString(svgString, 'image/svg+xml');
    },

    validateSVG(svgDoc) {
        const errorNode = svgDoc.querySelector('parsererror');
        if (errorNode) throw new Error('Invalid SVG syntax');
        
        const svgElement = svgDoc.documentElement;
        if (!svgElement || svgElement.tagName !== 'svg') {
            throw new Error('No SVG element found');
        }
        
        return svgElement;
    },

    cleanSVG(svgElement) {
        const cleanElement = svgElement.cloneNode(true);
        let idCounter = 0;
        
        const allElements = cleanElement.querySelectorAll('*');
        allElements.forEach(element => {
            if (!element.id) {
                element.id = `elem_${idCounter++}`;
            }
        });
        
        return cleanElement;
    },

    getViewBox(svgElement) {
        if (!svgElement) return null;
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const [x, y, width, height] = viewBox.split(' ').map(Number);
            return { x, y, width, height };
        }
        return null;
    },

    // New: Find SVG element from click target
    findSVGElement(target, previewContainer) {
        if (!target || !previewContainer) return null;
        
        while (target && target !== previewContainer && target !== document.body) {
            // Check if it's an SVG element (has tagName and is not the container)
            if (target.tagName && target.id && target !== previewContainer.querySelector('#preview')?.firstChild) {
                // Make sure it's an actual SVG element, not UI overlay
                const isUIElement = target.classList.contains('grid-overlay') ||
                                   target.classList.contains('viewbox-indicator') ||
                                   target.classList.contains('selection-overlay') ||
                                   target.classList.contains('selection-info') ||
                                   target.classList.contains('tool-popup');
                
                if (!isUIElement) {
                    return target;
                }
            }
            target = target.parentElement;
        }
        return null;
    },

    // New: Get element path in SVG
    getElementPath(element) {
        if (!element) return [];
        const path = [];
        let current = element;
        while (current && current.tagName && current !== document.body) {
            path.unshift({
                tag: current.tagName,
                id: current.id,
                class: current.className
            });
            current = current.parentElement;
        }
        return path;
    }
};
