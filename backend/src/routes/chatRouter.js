"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var chatController_js_1 = require("../controllers/chatController.js");
var router = (0, express_1.Router)();
// POST /api/chat - Generate chat response
router.post('/', chatController_js_1.chat);
// POST /api/chat/identify-machine - Identify machine from image
router.post('/identify-machine', chatController_js_1.identifyMachine);
exports.default = router;
