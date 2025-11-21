"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.deleteRepair = exports.updateRepair = exports.createRepair = exports.getRepairById = exports.getAllRepairs = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// GET /api/repairs - Get all saved repairs (without full messages)
var getAllRepairs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var repairs, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.savedRepair.findMany({
                        orderBy: { timestamp: 'desc' },
                        include: {
                            messages: {
                                select: {
                                    id: true,
                                    role: true,
                                    text: true,
                                },
                                take: 1, // Only include first message for preview
                            },
                        },
                    })];
            case 1:
                repairs = _a.sent();
                res.json(repairs);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching repairs:', error_1);
                res.status(500).json({ error: 'Failed to fetch repairs' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllRepairs = getAllRepairs;
// GET /api/repairs/:id - Get a specific repair with all messages
var getRepairById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, repair, formattedRepair, error_2;
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
                                orderBy: { createdAt: 'asc' },
                            },
                        },
                    })];
            case 1:
                repair = _a.sent();
                if (!repair) {
                    return [2 /*return*/, res.status(404).json({ error: 'Repair not found' })];
                }
                formattedRepair = {
                    id: repair.id,
                    name: repair.name,
                    machineModel: repair.machineModel,
                    serialNumber: repair.serialNumber,
                    timestamp: repair.timestamp.getTime(),
                    messages: repair.messages.map(function (msg) { return (__assign(__assign({ role: msg.role, text: msg.text }, (msg.attachment && {
                        attachment: {
                            url: msg.attachment.url,
                            type: msg.attachment.type,
                        },
                    })), (msg.groundingMetadata && {
                        groundingMetadata: msg.groundingMetadata,
                    }))); }),
                };
                res.json(formattedRepair);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching repair:', error_2);
                res.status(500).json({ error: 'Failed to fetch repair' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getRepairById = getRepairById;
// POST /api/repairs - Create a new repair
var createRepair = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, machineModel, serialNumber, messages, timestamp, repair, formattedRepair, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_1 = _a.name, machineModel = _a.machineModel, serialNumber = _a.serialNumber, messages = _a.messages, timestamp = _a.timestamp;
                // Validation
                if (!name_1 || !messages || messages.length === 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'Name and messages are required' })];
                }
                return [4 /*yield*/, prisma.savedRepair.create({
                        data: {
                            name: name_1,
                            machineModel: machineModel,
                            serialNumber: serialNumber,
                            timestamp: timestamp ? new Date(timestamp) : new Date(),
                            messages: {
                                create: messages.map(function (msg) { return (__assign({ role: msg.role, text: msg.text, groundingMetadata: msg.groundingMetadata || undefined }, (msg.attachment && {
                                    attachment: {
                                        create: {
                                            url: msg.attachment.url,
                                            type: msg.attachment.type,
                                        },
                                    },
                                }))); }),
                            },
                        },
                        include: {
                            messages: {
                                include: {
                                    attachment: true,
                                },
                            },
                        },
                    })];
            case 1:
                repair = _b.sent();
                formattedRepair = {
                    id: repair.id,
                    name: repair.name,
                    machineModel: repair.machineModel,
                    serialNumber: repair.serialNumber,
                    timestamp: repair.timestamp.getTime(),
                    messages: repair.messages.map(function (msg) { return (__assign(__assign({ role: msg.role, text: msg.text }, (msg.attachment && {
                        attachment: {
                            url: msg.attachment.url,
                            type: msg.attachment.type,
                        },
                    })), (msg.groundingMetadata && {
                        groundingMetadata: msg.groundingMetadata,
                    }))); }),
                };
                res.status(201).json(formattedRepair);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('Error creating repair:', error_3);
                res.status(500).json({ error: 'Failed to create repair' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createRepair = createRepair;
// PUT /api/repairs/:id - Update a repair
var updateRepair = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name_2, machineModel, serialNumber, repair, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, name_2 = _a.name, machineModel = _a.machineModel, serialNumber = _a.serialNumber;
                return [4 /*yield*/, prisma.savedRepair.update({
                        where: { id: id },
                        data: __assign(__assign(__assign({}, (name_2 && { name: name_2 })), (machineModel !== undefined && { machineModel: machineModel })), (serialNumber !== undefined && { serialNumber: serialNumber })),
                        include: {
                            messages: {
                                include: {
                                    attachment: true,
                                },
                            },
                        },
                    })];
            case 1:
                repair = _b.sent();
                res.json(repair);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('Error updating repair:', error_4);
                if (error_4.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Repair not found' })];
                }
                res.status(500).json({ error: 'Failed to update repair' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateRepair = updateRepair;
// DELETE /api/repairs/:id - Delete a repair
var deleteRepair = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, prisma.savedRepair.delete({
                        where: { id: id },
                    })];
            case 1:
                _a.sent();
                res.json({ message: 'Repair deleted successfully' });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error deleting repair:', error_5);
                if (error_5.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Repair not found' })];
                }
                res.status(500).json({ error: 'Failed to delete repair' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteRepair = deleteRepair;
// Graceful shutdown
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
