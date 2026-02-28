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
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        return {
            left: rect.left - containerRect.left + container.scrollLeft,
            top: rect.top - containerRect.top + container.scrollTop,
            width: rect.width,
            height: rect.height
        };
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
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const [x, y, width, height] = viewBox.split(' ').map(Number);
            return { x, y, width, height };
        }
        return null;
    }
};
