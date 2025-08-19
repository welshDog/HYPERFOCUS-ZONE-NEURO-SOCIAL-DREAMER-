/**
 * 📝💎⚡ Request Logger Middleware - API Activity Tracking ⚡💎📝
 */

const logger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Log request
    console.log(`📝 ${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

    // Capture response details
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';

        console.log(`${statusColor} ${res.statusCode} - ${req.method} ${req.originalUrl} - ${duration}ms`);

        // Call original send
        originalSend.call(this, body);
    };

    next();
};

module.exports = logger;
