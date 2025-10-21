const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
    });

    next();
};

const errorLogger = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, {
        method: req.method,
        path: req.path,
        error: err.message,
        stack: err.stack
    });

    next(err);
};

module.exports = {
    requestLogger,
    errorLogger
};
