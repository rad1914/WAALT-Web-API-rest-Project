
// rateLimiter.js

class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit; // Maximum number of requests allowed
        this.interval = interval; // Time interval in milliseconds
        this.requests = new Map(); // Store requests timestamps
    }

    /**
     * Checks if a request is allowed based on the rate limit.
     * @param {string} userId - Unique identifier for the user (could be an IP address or user ID).
     * @returns {boolean} - True if the request is allowed, false otherwise.
     */
    isAllowed(userId) {
        const now = Date.now();
        const timestamps = this.requests.get(userId) || [];

        // Filter out timestamps older than the defined interval
        const validTimestamps = timestamps.filter(timestamp => now - timestamp < this.interval);

        if (validTimestamps.length < this.limit) {
            // Add the current timestamp to the valid timestamps and update the map
            validTimestamps.push(now);
            this.requests.set(userId, validTimestamps);
            return true; // Request is allowed
        }

        return false; // Request is denied due to rate limit
    }

}

export default RateLimiter;