"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var repairsController_js_1 = require("../controllers/repairsController.js");
var router = (0, express_1.Router)();
// GET /api/repairs - Get all saved repairs
router.get('/', repairsController_js_1.getAllRepairs);
// GET /api/repairs/:id - Get a specific repair by ID
router.get('/:id', repairsController_js_1.getRepairById);
// POST /api/repairs - Create a new repair
router.post('/', repairsController_js_1.createRepair);
// PUT /api/repairs/:id - Update a repair
router.put('/:id', repairsController_js_1.updateRepair);
// DELETE /api/repairs/:id - Delete a repair
router.delete('/:id', repairsController_js_1.deleteRepair);
exports.default = router;
