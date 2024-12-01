// rateLimiter.js

class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit; // Maximum requests allowed per interval
        this.interval = interval; // Time interval in milliseconds
        this.requests = new Map(); // Store user request timestamps
        this.blockedIPs = new Map(); // Store blocked IPs and their unlock times
        this.lockDurations = new Map(); // Gradually increase lock durations
    }

    /**
     * Checks if a request is allowed based on rate limit and lock status.
     * @param {string} ip - User's IP address.
     * @returns {boolean} - True if request is allowed, false if blocked.
     */
    isAllowed(ip) {
        const now = Date.now();

        // Check if IP is currently blocked
        if (this.blockedIPs.has(ip)) {
            const unlockTime = this.blockedIPs.get(ip);
            if (now < unlockTime) return false;
            this.blockedIPs.delete(ip);
            this.lockDurations.set(ip, 0); // Reset lock duration after unlock
        }

        const timestamps = this.requests.get(ip) || [];
        const validTimestamps = timestamps.filter(t => now - t < this.interval);

        if (validTimestamps.length < this.limit) {
            validTimestamps.push(now);
            this.requests.set(ip, validTimestamps);
            return true;
        }

        // Gradual lock when limit is exceeded
        this.applyGradualLock(ip, now);
        return false;
    }

    /**
     * Apply a gradual lock for repeated requests beyond the limit.
     * @param {string} ip - User's IP address.
     * @param {number} now - Current timestamp.
     */
    applyGradualLock(ip, now) {
        const baseLockTime = 90000; // Initial lock time: 30 seconds
        const currentLockDuration = this.lockDurations.get(ip) || 0;
        const newLockDuration = currentLockDuration ? currentLockDuration * 2 : baseLockTime;

        this.blockedIPs.set(ip, now + newLockDuration);
        this.lockDurations.set(ip, newLockDuration);
        console.warn(`IP ${ip} is locked for ${newLockDuration / 1000} seconds.`);
    }

    /**
     * Resets the lock and request history for a specific IP.
     * @param {string} ip - User's IP address.
     */
    reset(ip) {
        this.requests.delete(ip);
        this.blockedIPs.delete(ip);
        this.lockDurations.delete(ip);
    }
}

export default RateLimiter;
