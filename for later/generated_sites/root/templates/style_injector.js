/**
 * Style Injector for Dental Instructions CMS
 * Handles dynamic CSS framework loading and styling
 */

class StyleInjector {
    constructor() {
        this.loadedFrameworks = new Set();
        this.customStyles = new Map();
    }

    /**
     * Load a CSS framework dynamically
     * @param {string} framework - Framework name ('tailwind', 'bootstrap', 'basic')
     * @param {Object} options - Framework options
     */
    async loadFramework(framework, options = {}) {
        if (this.loadedFrameworks.has(framework)) {
            return; // Already loaded
        }

        switch (framework) {
            case 'tailwind':
                await this.loadTailwind(options);
                break;
            case 'bootstrap':
                await this.loadBootstrap(options);
                break;
            case 'basic':
                this.applyBasicStyles();
                break;
            default:
                console.warn(`Unknown framework: ${framework}`);
        }

        this.loadedFrameworks.add(framework);
    }

    /**
     * Load Tailwind CSS
     */
    async loadTailwind(options = {}) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = options.cdn || 'https://cdn.tailwindcss.com';
            link.onload = () => resolve();

            document.head.appendChild(link);
        });
    }

    /**
     * Load Bootstrap CSS
     */
    async loadBootstrap(options = {}) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = options.cdn || 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
            link.onload = () => resolve();

            document.head.appendChild(link);
        });
    }

    /**
     * Apply basic custom styles
     */
    applyBasicStyles() {
        const basicStyles = `
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: white;
                color: black;
            }

            .qr-btn, .credits-btn, .home-button {
                position: fixed;
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }

            .qr-btn {
                bottom: 20px;
                left: 20px;
            }

            .credits-btn {
                bottom: 20px;
                right: 20px;
            }

            .home-button {
                top: 20px;
                right: 20px;
            }

            h1 {
                text-align: center;
                margin-bottom: 30px;
                color: #333;
            }

            p {
                margin-bottom: 15px;
                line-height: 1.6;
            }

            ul {
                margin-bottom: 15px;
            }

            li {
                margin-bottom: 5px;
            }
        `;

        const style = document.createElement('style');
        style.textContent = basicStyles;
        document.head.appendChild(style);
    }

    /**
     * Load custom CSS file
     * @param {string} cssPath - Path to custom CSS file
     * @param {string} siteVersion - Site version identifier
     */
    async loadCustomStyles(cssPath, siteVersion) {
        if (this.customStyles.has(siteVersion)) {
            return; // Already loaded
        }

        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            link.onload = () => {
                this.customStyles.set(siteVersion, cssPath);
                resolve();
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Apply responsive design classes
     * @param {string} framework - CSS framework being used
     */
    applyResponsiveClasses(framework) {
        const body = document.body;
        const mainContainer = document.getElementById('main-container');

        if (framework === 'tailwind') {
            body.className = 'bg-slate-800 text-slate-100 font-sans p-5 flex flex-col min-h-screen relative';
            if (mainContainer) {
                mainContainer.className = 'max-w-4xl mx-auto';
            }
        } else if (framework === 'bootstrap') {
            body.className = 'bg-light text-dark p-3';
            if (mainContainer) {
                mainContainer.className = 'container';
            }
        } else {
            body.className = '';
            if (mainContainer) {
                mainContainer.className = '';
            }
        }
    }

    /**
     * Apply button styling based on framework
     * @param {string} framework - CSS framework being used
     */
    applyButtonStyles(framework) {
        const buttons = ['qr-button', 'credits-button', 'home-button'];

        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                if (framework === 'tailwind') {
                    button.className = 'bg-gray-600 text-slate-100 text-xs border-none rounded-lg px-2 py-1 cursor-pointer transition-all duration-300 shadow-lg hover:bg-gray-500';
                    if (buttonId === 'qr-button') {
                        button.className = 'absolute bottom-5 left-5 bg-transparent border-none rounded-lg p-1 text-lg cursor-pointer transition-all duration-300 w-12 text-slate-100';
                    } else if (buttonId === 'credits-button') {
                        button.className = 'absolute bottom-5 right-5 bg-gray-600 text-slate-100 text-xs border-none rounded-lg px-2 py-1 cursor-pointer transition-all duration-300 shadow-lg hover:bg-gray-500';
                    } else if (buttonId === 'home-button') {
                        button.className = 'absolute top-5 right-5 bg-gray-600 text-slate-100 text-xs border-none rounded-lg px-2 py-1 cursor-pointer transition-all duration-300 shadow-lg hover:bg-gray-500';
                    }
                } else if (framework === 'bootstrap') {
                    button.className = 'btn btn-primary btn-sm';
                } else {
                    button.className = 'basic-button';
                }
            }
        });
    }

    /**
     * Apply content styling
     * @param {string} framework - CSS framework being used
     */
    applyContentStyles(framework) {
        const contentArea = document.getElementById('content-area');
        const title = document.getElementById('instruction-title');

        if (!contentArea || !title) return;

        if (framework === 'tailwind') {
            title.className = 'text-4xl font-bold text-center mb-8 text-white';
            contentArea.className = 'space-y-4';
        } else if (framework === 'bootstrap') {
            title.className = 'h1 text-center mb-4';
            contentArea.className = 'lead';
        } else {
            title.className = 'instruction-title';
            contentArea.className = 'instruction-content';
        }
    }
}

// Create global instance
const styleInjector = new StyleInjector();

// Export for use in other scripts
window.StyleInjector = styleInjector;
