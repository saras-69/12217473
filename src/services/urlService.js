import FrontendLogger from '../utils/logger';

class URLService {
    constructor() {
        this.urls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
        this.logger = new FrontendLogger();
        // Don't call async method directly in constructor
        // Instead, we'll initialize logging but not await it
        this.initializeLogger();
    }

    async initializeLogger() {
        // Call without await in the constructor context
        return this.logger.info('api', 'URLService initialized');
    }

    generateShortCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isShortCodeUnique(shortCode) {
        return !this.urls.some(url => url.shortCode === shortCode);
    }

    async createShortUrl(originalUrl, customShortCode = '', validityMinutes = 30) {
        try {
            await this.logger.info('api', `Creating short URL for: ${originalUrl.substring(0, 50)}...`);

            // Validate URL
            if (!this.isValidUrl(originalUrl)) {
                await this.logger.error('api', `Invalid URL provided: ${originalUrl}`);
                throw new Error('Invalid URL format');
            }

            // Handle shortcode
            let shortCode = customShortCode;
            if (!shortCode) {
                do {
                    shortCode = this.generateShortCode();
                } while (!this.isShortCodeUnique(shortCode));
                await this.logger.debug('api', `Generated shortcode: ${shortCode}`);
            } else {
                if (!this.isShortCodeUnique(shortCode)) {
                    await this.logger.error('api', `Short code collision: ${shortCode}`);
                    throw new Error('Short code already exists');
                }
            }

            const now = new Date();
            const expiryDate = new Date(now.getTime() + validityMinutes * 60000);

            const urlData = {
                id: Date.now() + Math.random(),
                originalUrl,
                shortCode,
                shortUrl: `http://localhost:3000/${shortCode}`,
                createdAt: now.toISOString(),
                expiryDate: expiryDate.toISOString(),
                clicks: [],
                totalClicks: 0
            };

            this.urls.push(urlData);
            this.saveToStorage();

            await this.logger.info('api', `Short URL created successfully: ${shortCode}`);
            return urlData;
        } catch (error) {
            await this.logger.error('api', `Failed to create short URL: ${error.message}`);
            throw error;
        }
    }

    async getUrlByShortCode(shortCode) {
        try {
            const urlData = this.urls.find(url => url.shortCode === shortCode);

            if (!urlData) {
                await this.logger.warn('api', `Short code not found: ${shortCode}`);
                return null;
            }

            // Check if expired
            if (new Date() > new Date(urlData.expiryDate)) {
                await this.logger.warn('api', `Expired URL accessed: ${shortCode}`);
                return null;
            }

            return urlData;
        } catch (error) {
            await this.logger.error('api', `Error retrieving URL: ${error.message}`);
            throw error;
        }
    }

    async recordClick(shortCode, source = 'direct', location = 'localhost') {
        try {
            const urlIndex = this.urls.findIndex(url => url.shortCode === shortCode);

            if (urlIndex === -1) {
                await this.logger.error('api', `Cannot record click - URL not found: ${shortCode}`);
                return false;
            }

            const clickData = {
                timestamp: new Date().toISOString(),
                source,
                location
            };

            this.urls[urlIndex].clicks.push(clickData);
            this.urls[urlIndex].totalClicks++;
            this.saveToStorage();

            await this.logger.info('api', `Click recorded for ${shortCode} from ${source}`);
            return true;
        } catch (error) {
            await this.logger.error('api', `Failed to record click: ${error.message}`);
            return false;
        }
    }

    getAllUrls() {
        return this.urls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    saveToStorage() {
        localStorage.setItem('shortenedUrls', JSON.stringify(this.urls));
    }
}

export default new URLService();