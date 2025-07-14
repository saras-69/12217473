import axios from 'axios';

class FrontendLogger {
    constructor(baseURL = 'http://20.244.56.144/evaluation-service', authToken = null) {
        this.baseURL = baseURL;
        this.authToken = authToken;
        this.logEndpoint = `${baseURL}/logs`;

        // Valid values for frontend
        this.validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
        this.validPackages = ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'];
    }

    setAuthToken(token) {
        this.authToken = token;
    }

    validateLogParameters(level, packageName) {
        if (!this.validLevels.includes(level.toLowerCase())) {
            throw new Error(`Invalid level: ${level}. Must be one of: ${this.validLevels.join(', ')}`);
        }

        if (!this.validPackages.includes(packageName.toLowerCase())) {
            throw new Error(`Invalid package '${packageName}' for frontend. Valid packages: ${this.validPackages.join(', ')}`);
        }
    }

    async Log(level, packageName, message) {
        try {
            this.validateLogParameters(level, packageName);

            if (!this.authToken) {
                // Fallback: store in session for later when token is available
                const pendingLogs = JSON.parse(sessionStorage.getItem('pendingLogs') || '[]');
                pendingLogs.push({ level, packageName, message, timestamp: new Date().toISOString() });
                sessionStorage.setItem('pendingLogs', JSON.stringify(pendingLogs));
                return;
            }

            const requestBody = {
                stack: 'frontend',
                level: level.toLowerCase(),
                package: packageName.toLowerCase(),
                message: message
            };

            const response = await axios.post(this.logEndpoint, requestBody, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            return response.data;
        } catch (error) {
            // Silent fail for logging to avoid breaking the app
        }
    }

    async debug(packageName, message) {
        return this.Log('debug', packageName, message);
    }

    async info(packageName, message) {
        return this.Log('info', packageName, message);
    }

    async warn(packageName, message) {
        return this.Log('warn', packageName, message);
    }

    async error(packageName, message) {
        return this.Log('error', packageName, message);
    }

    async fatal(packageName, message) {
        return this.Log('fatal', packageName, message);
    }
}

export default FrontendLogger;