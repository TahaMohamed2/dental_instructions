/**
 * Asset Manager for Dental Instructions CMS (Working Version)
 * Handles dynamic loading of images, scripts, and other assets
 */

class AssetManager {
    constructor() {
        this.loadedAssets = new Map();
        this.assetPaths = new Map();
        this.qrViewerLoaded = false;
    }

    /**
     * Initialize asset paths for different site versions
     * @param {string} siteVersion - Site version identifier
     */
    initializeAssetPaths(siteVersion) {
        const assetConfigs = {
            'dr_taha': {
                favicon: 'resources/instructions_logo.ico',
                qrImage: 'resources/QR.png',
                qrScript: 'QR_image_viewer.js',
                customStyles: 'styles.css',
                homeUrl: 'index.html',
                creditsUrl: 'credits.html',
                resources: 'resources/'
            },
            'playground': {
                favicon: 'resources/instructions_logo.ico',
                qrImage: 'resources/QR.png',
                qrScript: 'QR_image_viewer.js',
                customStyles: 'styles.css',
                homeUrl: 'index.html',
                creditsUrl: 'credits.html',
                resources: 'resources/'
            },
            'root': {
                favicon: 'resources/instructions_logo.ico',
                qrImage: 'resources/QR.png',
                qrScript: 'QR_image_viewer.js',
                customStyles: 'styles.css',
                homeUrl: 'index.html',
                creditsUrl: 'credits.html',
                resources: 'resources/'
            }
        };

        this.assetPaths = assetConfigs[siteVersion] || assetConfigs['root'];
    }

    /**
     * Load QR code viewer script
     */
    async loadQRViewer() {
        if (this.qrViewerLoaded) {
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.assetPaths.qrScript;
            script.onload = () => {
                this.qrViewerLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load QR viewer script'));

            document.head.appendChild(script);
        });
    }

    /**
     * Set favicon
     */
    setFavicon() {
        const favicon = document.getElementById('favicon');
        if (favicon) {
            favicon.href = this.assetPaths.favicon;
        }
    }

    /**
     * Set QR image
     */
    setQRImage() {
        const qrImage = document.getElementById('qr-image');
        if (qrImage) {
            qrImage.src = this.assetPaths.qrImage;
        }
    }

    /**
     * Set navigation URLs
     */
    setNavigationUrls() {
        const homeButton = document.getElementById('home-button');
        const creditsButton = document.getElementById('credits-button');

        if (homeButton) {
            homeButton.onclick = () => window.location.href = this.assetPaths.homeUrl;
        }

        if (creditsButton) {
            creditsButton.onclick = () => window.location.href = this.assetPaths.creditsUrl;
        }
    }

    /**
     * Load custom styles
     */
    async loadCustomStyles() {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.assetPaths.customStyles;
            link.onload = () => resolve();

            document.head.appendChild(link);
        });
    }

    /**
     * Get resource path for current site version
     * @param {string} resourceName - Resource filename
     * @returns {string} Full path to resource
     */
    getResourcePath(resourceName) {
        return this.assetPaths.resources + resourceName;
    }

    /**
     * Load image dynamically
     * @param {string} imagePath - Path to image
     * @param {string} altText - Alt text for image
     * @returns {Promise<HTMLImageElement>} Promise resolving to image element
     */
    async loadImage(imagePath, altText = '') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
            img.src = imagePath;
            img.alt = altText;
        });
    }

    /**
     * Create button with image
     * @param {string} imagePath - Path to button image
     * @param {string} altText - Alt text for button
     * @param {Function} onClick - Click handler
     * @returns {HTMLElement} Button element
     */
    async createImageButton(imagePath, altText, onClick) {
        try {
            const img = await this.loadImage(imagePath, altText);
            const button = document.createElement('button');

            button.className = 'image-button';
            button.onclick = onClick;
            button.appendChild(img);

            return button;
        } catch (error) {
            console.error('Error creating image button:', error);
            return null;
        }
    }

    /**
     * Initialize all assets for the site
     * @param {string} siteVersion - Site version identifier
     */
    async initializeAssets(siteVersion) {
        this.initializeAssetPaths(siteVersion);

        try {
            // Load QR viewer script
            await this.loadQRViewer();

            // Set favicon
            this.setFavicon();

            // Set QR image
            this.setQRImage();

            // Set navigation URLs
            this.setNavigationUrls();

            // Load custom styles
            await this.loadCustomStyles();

            console.log(`Assets initialized for ${siteVersion} site`);
        } catch (error) {
            console.error('Error initializing assets:', error);
        }
    }

    /**
     * Get asset loading status
     * @returns {Object} Status of loaded assets
     */
    getAssetStatus() {
        return {
            qrViewerLoaded: this.qrViewerLoaded,
            loadedAssets: Array.from(this.loadedAssets.keys()),
            assetPaths: Object.fromEntries(this.assetPaths)
        };
    }

    /**
     * Preload critical assets
     * @param {Array} assetPaths - Array of asset paths to preload
     */
    async preloadAssets(assetPaths) {
        const preloadPromises = assetPaths.map(path => {
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = path;
                link.onload = () => resolve();

                document.head.appendChild(link);
            });
        });

        await Promise.all(preloadPromises);
    }
}

// Create global instance
const assetManager = new AssetManager();

// Export for use in other scripts
window.AssetManager = assetManager;
