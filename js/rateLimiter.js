// rateLimiter.js

class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit;
        this.interval = interval;
        this.requests = new Map();
        this.blockedIPs = new Map();
        this.lockDurations = new Map();
    }

    isAllowed(ip) {
        const now = Date.now();

        if (this.isBlocked(ip, now)) {
            return false;
        }

        const timestamps = this.getValidRequests(ip, now);

        if (timestamps.length < this.limit) {
            this.addRequest(ip, timestamps, now);
            return true;
        }

        this.applyGradualLock(ip, now);
        return false;
    }

    isBlocked(ip, now) {
        if (this.blockedIPs.has(ip)) {
            const unlockTime = this.blockedIPs.get(ip);
            if (now < unlockTime) return true;
            this.clearBlock(ip);
        }
        return false;
    }

    getValidRequests(ip, now) {
        const timestamps = this.requests.get(ip) || [];
        return timestamps.filter(t => now - t < this.interval);
    }

    addRequest(ip, timestamps, now) {
        timestamps.push(now);
        this.requests.set(ip, timestamps);
    }

    applyGradualLock(ip, now) {
        const baseLockTime = 90000;
        const currentLockDuration = this.lockDurations.get(ip) || 0;
        const newLockDuration = currentLockDuration ? currentLockDuration * 2 : baseLockTime;

        this.blockedIPs.set(ip, now + newLockDuration);
        this.lockDurations.set(ip, newLockDuration);
        console.warn(`IP ${ip} is locked for ${newLockDuration / 1000} seconds.`);
    }

    clearBlock(ip) {
        this.blockedIPs.delete(ip);
        this.lockDurations.set(ip, 0);
    }

    reset(ip) {
        this.requests.delete(ip);
        this.clearBlock(ip);
    }
}

export default RateLimiter;
