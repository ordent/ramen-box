"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestBody = (request) => {
    return Object.assign({}, request.all(), request.files());
};
exports.capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};
