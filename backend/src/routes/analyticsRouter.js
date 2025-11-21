"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var analyticsController_js_1 = require("../controllers/analyticsController.js");
var router = (0, express_1.Router)();
// GET /api/analytics/stats - Estadísticas generales
router.get('/stats', analyticsController_js_1.getStats);
// GET /api/analytics/search - Buscar reparaciones
router.get('/search', analyticsController_js_1.searchRepairs);
// GET /api/analytics/export - Exportar datos (CSV o JSON)
router.get('/export', analyticsController_js_1.exportData);
// GET /api/analytics/models - Lista de modelos
router.get('/models', analyticsController_js_1.getModels);
// GET /api/analytics/repair/:id/full - Reparación completa
router.get('/repair/:id/full', analyticsController_js_1.getFullRepair);
// POST /api/analytics/query - Consulta personalizada (solo desarrollo)
router.post('/query', analyticsController_js_1.customQuery);
exports.default = router;
