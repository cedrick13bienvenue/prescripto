"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerRouter = void 0;
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("../swagger/config");
const swaggerRouter = (0, express_1.Router)();
exports.swaggerRouter = swaggerRouter;
// Serve swagger documentation
swaggerRouter.use('/docs', swagger_ui_express_1.default.serve);
swaggerRouter.get('/docs', swagger_ui_express_1.default.setup(config_1.swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MedConnect API Documentation',
}));
// Serve swagger JSON
swaggerRouter.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(config_1.swaggerSpec);
});
