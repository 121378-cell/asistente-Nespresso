"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customQuery = exports.getFullRepair = exports.getModels = exports.exportData = exports.searchRepairs = exports.getStats = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// GET /api/analytics/stats - Obtener estadísticas generales
var getStats = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalRepairs, totalMessages, recentRepairs, repairsByModel, allRepairs, repairsByMonthMap_1, repairsByMonth, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, Promise.all([
                        prisma.savedRepair.count(),
                        prisma.message.count(),
                        prisma.savedRepair.count({
                            where: {
                                timestamp: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
                                },
                            },
                        }),
                    ])];
            case 1:
                _a = _b.sent(), totalRepairs = _a[0], totalMessages = _a[1], recentRepairs = _a[2];
                return [4 /*yield*/, prisma.savedRepair.groupBy({
                        by: ['machineModel'],
                        _count: {
                            machineModel: true,
                        },
                        orderBy: {
                            _count: {
                                machineModel: 'desc',
                            },
                        },
                    })];
            case 2:
                repairsByModel = _b.sent();
                return [4 /*yield*/, prisma.savedRepair.findMany({
                        select: { timestamp: true }
                    })];
            case 3:
                allRepairs = _b.sent();
                repairsByMonthMap_1 = new Map();
                allRepairs.forEach(function (r) {
                    try {
                        var date = new Date(r.timestamp);
                        var month = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-01T00:00:00.000Z");
                        repairsByMonthMap_1.set(month, (repairsByMonthMap_1.get(month) || 0) + 1);
                    }
                    catch (e) {
                        console.warn('Invalid date in repair:', r);
                    }
                });
                repairsByMonth = Array.from(repairsByMonthMap_1.entries())
                    .map(function (_a) {
                    var month = _a[0], count = _a[1];
                    return ({ month: month, count: count });
                })
                    .sort(function (a, b) { return b.month.localeCompare(a.month); })
                    .slice(0, 12);
                res.json({
                    totalRepairs: totalRepairs,
                    totalMessages: totalMessages,
                    recentRepairs: recentRepairs,
                    repairsByModel: repairsByModel.map(function (r) { return ({
                        model: r.machineModel || 'Sin modelo',
                        count: r._count.machineModel,
                    }); }),
                    repairsByMonth: repairsByMonth,
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error('Error fetching stats:', JSON.stringify(error_1, null, 2));
                if (error_1 instanceof Error) {
                    console.error('Stack:', error_1.stack);
                    console.error('Message:', error_1.message);
                }
                res.status(500).json({ error: 'Failed to fetch statistics', details: error_1 instanceof Error ? error_1.message : String(error_1) });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getStats = getStats;
// GET /api/analytics/search - Buscar en reparaciones
var searchRepairs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, query, model, startDate, endDate, _b, limit, _c, offset, where, _d, repairs, total, error_2;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.query, query = _a.query, model = _a.model, startDate = _a.startDate, endDate = _a.endDate, _b = _a.limit, limit = _b === void 0 ? 50 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c;
                where = {};
                // Búsqueda por texto
                if (query) {
                    where.OR = [
                        { name: { contains: query, mode: 'insensitive' } },
                        { machineModel: { contains: query, mode: 'insensitive' } },
                        { serialNumber: { contains: query, mode: 'insensitive' } },
                    ];
                }
                // Filtro por modelo
                if (model) {
                    where.machineModel = model;
                }
                // Filtro por fecha
                if (startDate || endDate) {
                    where.timestamp = {};
                    if (startDate) {
                        where.timestamp.gte = new Date(startDate);
                    }
                    if (endDate) {
                        where.timestamp.lte = new Date(endDate);
                    }
                }
                return [4 /*yield*/, Promise.all([
                        prisma.savedRepair.findMany({
                            where: where,
                            include: {
                                messages: {
                                    select: {
                                        id: true,
                                        role: true,
                                        text: true,
                                    },
                                },
                            },
                            orderBy: { timestamp: 'desc' },
                            take: Number(limit),
                            skip: Number(offset),
                        }),
                        prisma.savedRepair.count({ where: where }),
                    ])];
            case 1:
                _d = _e.sent(), repairs = _d[0], total = _d[1];
                res.json({
                    repairs: repairs,
                    total: total,
                    limit: Number(limit),
                    offset: Number(offset),
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _e.sent();
                console.error('Error searching repairs:', error_2);
                res.status(500).json({ error: 'Failed to search repairs' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.searchRepairs = searchRepairs;
// GET /api/analytics/export - Exportar datos
var exportData = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, format, model, startDate, endDate, where, repairs, csvRows_1, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.format, format = _b === void 0 ? 'json' : _b, model = _a.model, startDate = _a.startDate, endDate = _a.endDate;
                where = {};
                if (model)
                    where.machineModel = model;
                if (startDate || endDate) {
                    where.timestamp = {};
                    if (startDate)
                        where.timestamp.gte = new Date(startDate);
                    if (endDate)
                        where.timestamp.lte = new Date(endDate);
                }
                return [4 /*yield*/, prisma.savedRepair.findMany({
                        where: where,
                        include: {
                            messages: {
                                include: {
                                    attachment: true,
                                },
                            },
                        },
                        orderBy: { timestamp: 'desc' },
                    })];
            case 1:
                repairs = _c.sent();
                if (format === 'csv') {
                    csvRows_1 = [
                        ['ID', 'Nombre', 'Modelo', 'Número de Serie', 'Fecha', 'Mensajes'].join(','),
                    ];
                    repairs.forEach(function (repair) {
                        var row = [
                            repair.id,
                            "\"".concat(repair.name.replace(/"/g, '""'), "\""),
                            repair.machineModel || '',
                            repair.serialNumber || '',
                            repair.timestamp.toISOString(),
                            repair.messages.length,
                        ].join(',');
                        csvRows_1.push(row);
                    });
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', "attachment; filename=repairs-".concat(Date.now(), ".csv"));
                    res.send(csvRows_1.join('\n'));
                }
                else {
                    // Generar JSON
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Content-Disposition', "attachment; filename=repairs-".concat(Date.now(), ".json"));
                    res.json(repairs);
                }
                return [3 /*break*/, 3];
            case 2:
                error_3 = _c.sent();
                console.error('Error exporting data:', error_3);
                res.status(500).json({ error: 'Failed to export data' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.exportData = exportData;
// GET /api/analytics/models - Obtener lista de modelos
var getModels = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var models, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.savedRepair.findMany({
                        where: {
                            machineModel: {
                                not: null,
                            },
                        },
                        select: {
                            machineModel: true,
                        },
                        distinct: ['machineModel'],
                        orderBy: {
                            machineModel: 'asc',
                        },
                    })];
            case 1:
                models = _a.sent();
                res.json(models.map(function (m) { return m.machineModel; }));
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error fetching models:', JSON.stringify(error_4, null, 2));
                if (error_4 instanceof Error) {
                    console.error('Stack:', error_4.stack);
                    console.error('Message:', error_4.message);
                }
                res.status(500).json({ error: 'Failed to fetch models', details: error_4 instanceof Error ? error_4.message : String(error_4) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getModels = getModels;
// GET /api/analytics/repair/:id/full - Obtener reparación completa con todos los detalles
var getFullRepair = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, repair, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, prisma.savedRepair.findUnique({
                        where: { id: id },
                        include: {
                            messages: {
                                include: {
                                    attachment: true,
                                },
                                orderBy: {
                                    createdAt: 'asc',
                                },
                            },
                        },
                    })];
            case 1:
                repair = _a.sent();
                if (!repair) {
                    return [2 /*return*/, res.status(404).json({ error: 'Repair not found' })];
                }
                res.json(repair);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error fetching full repair:', error_5);
                res.status(500).json({ error: 'Failed to fetch repair details' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFullRepair = getFullRepair;
// POST /api/analytics/query - Consulta SQL personalizada (solo para desarrollo)
var customQuery = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // Solo permitir en desarrollo
                if (process.env.NODE_ENV === 'production') {
                    return [2 /*return*/, res.status(403).json({ error: 'Custom queries not allowed in production' })];
                }
                query = req.body.query;
                if (!query) {
                    return [2 /*return*/, res.status(400).json({ error: 'Query is required' })];
                }
                return [4 /*yield*/, prisma.$queryRawUnsafe(query)];
            case 1:
                result = _a.sent();
                res.json({ result: result });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error executing custom query:', error_6);
                res.status(500).json({ error: error_6.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.customQuery = customQuery;
