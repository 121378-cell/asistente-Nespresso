"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var repairsRouter_js_1 = require("./routes/repairsRouter.js");
var analyticsRouter_js_1 = require("./routes/analyticsRouter.js");
var chatRouter_js_1 = require("./routes/chatRouter.js");
// Load environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3001;
var FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Middleware
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' })); // Increased limit for image attachments
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Request logging middleware
app.use(function (req, res, next) {
    console.log("".concat(new Date().toISOString(), " - ").concat(req.method, " ").concat(req.path));
    next();
});
// Routes
app.use('/api/repairs', repairsRouter_js_1.default);
app.use('/api/analytics', analyticsRouter_js_1.default);
app.use('/api/chat', chatRouter_js_1.default);
// Health check endpoint
app.get('/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use(function (req, res) {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use(function (err, req, res, next) {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Server running on http://localhost:".concat(PORT));
    console.log("\uD83D\uDCCA Environment: ".concat(process.env.NODE_ENV || 'development'));
    console.log("\uD83C\uDF10 CORS enabled for: ".concat(FRONTEND_URL));
});
exports.default = app;
