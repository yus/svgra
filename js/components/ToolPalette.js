// ToolPalette.js

const ToolPalette = {
    render(containerId, tools) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        let currentGroup = [];
        
        tools.forEach(tool => {
            if (tool === null) {
                if (currentGroup.length > 0) {
                    container.appendChild(this.createGroup(currentGroup));
                    currentGroup = [];
                }
                container.appendChild(this.createSeparator());
            } else {
                const button = this.createButton(tool);
                currentGroup.push(button);
            }
        });
        
        if (currentGroup.length > 0) {
            container.appendChild(this.createGroup(currentGroup));
        }
    },

    createButton(options) {
        const button = document.createElement('button');
        button.id = options.id;
        button.className = `btn btn-icon ${options.className || ''}`;
        button.title = options.title;
        button.innerHTML = `<i data-lucide="${options.icon}" class="icon"></i>`;
        
        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }
        
        return button;
    },

    createGroup(buttons) {
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

    setActive(buttonId, isActive) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.toggle('active', isActive);
        }
    }
};
