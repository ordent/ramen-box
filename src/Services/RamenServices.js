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
Object.defineProperty(exports, "__esModule", { value: true });
const RamenResponse_1 = require("../Lifecycle/RamenResponse");
const RamenRepository_1 = require("../Repository/RamenRepository");
const Utilities_1 = require("../Utilities");
const RamenValidatorGenerator_1 = require("../Validator/RamenValidatorGenerator");
const isBase64 = require('is-base64');
const { FileServices } = require('./FileServices');
class RamenServices {
    constructor(item) {
        this.validator = null;
        this.properties = null;
        this.filter = null;
        this.sanity = null;
        this.response = null;
        this.configurations = {};
        this.services = [];
        this.validation = null;
        this.repository = new RamenRepository_1.default();
        this.configurations = {
            FileServices: function (item) {
                return ((typeof item === 'object') || ((typeof item === 'string') && (isBase64(item)) && (item.includes('data:image'))));
            }
        };
        this.services = [FileServices];
        this.response = new RamenResponse_1.default();
        // this.setResponse(new RamenResponse())
        if (item instanceof RamenRepository_1.default) {
            this.setRepository(item);
        }
        else {
            this.setRepository(new RamenRepository_1.default(item));
            const validator = new (RamenValidatorGenerator_1.RamenValidatorGenerator(item));
            this.setValidator(validator);
            this.getResponse().setTransformers(item.transformers);
            // console.log('transformer',this.getResponse().getTransformers())
        }
    }
    setRepository(repository) {
        this.repository = repository;
        return this;
    }
    getRepository() {
        return this.repository;
    }
    setFilter(filter = {}) {
        this.filter = filter;
        return this;
    }
    getFilter() {
        return this.filter;
    }
    setSanity(sanity = {}) {
        this.sanity = sanity;
        return this;
    }
    getSanity() {
        return this.sanity;
    }
    setResponse(response) {
        if (response instanceof RamenResponse_1.default) {
            this.response = response;
        }
        else {
            this.response = new RamenResponse_1.default(response);
        }
    }
    getResponse() {
        return this.response;
    }
    setValidator(validator) {
        this.validator = validator;
    }
    getValidator() {
        return this.validator;
    }
    setConfigurations(configurations = {}) {
        this.configurations = configurations;
        return this;
    }
    getConfigurations() {
        return this.configurations;
    }
    setServices(services = []) {
        this.services = Array.isArray(services) ? services : [services];
        return this;
    }
    getServices() {
        return this.services;
    }
    appendServices(services) {
        if (Array.isArray(services)) {
            this.services = this.services.concat(services);
        }
        else {
            this.services.push(services);
        }
        return this;
    }
    appendConfigurations(configurations) {
        this.configurations = Object.assign({}, this.configurations, configurations);
        return this;
    }
    resolveServices(entity) {
        let type, result = null;
        // check inside this configurations
        for (const key in this.configurations) {
            if (typeof this.configurations[key] === 'function') {
                if (this.configurations[key](entity)) {
                    type = key;
                    break;
                }
            }
            else {
                if (this.configurations[key].includes(entity)) {
                    type = key;
                    break;
                }
            }
        }
        // after getting value in configurations, resolve services based on services array
        this.services.forEach((element) => {
            result = (element.name === type) ? element : null;
        });
        return result;
    }
    fillProperties(items) {
        return __awaiter(this, void 0, void 0, function* () {
            this.properties = {};
            for (const key in items) {
                let service = this.resolveServices(items[key]);
                service = service ? new service() : service;
                this.properties[key] = service ? yield service.assign(items[key]) : items[key];
            }
            return this.properties;
        });
    }
    validate(value, type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validation = yield this.getValidator().validate(value, type);
            return this;
        });
    }
    sanitize(value, type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.properties = yield this.getValidator().sanitize(value, type);
            return this.properties;
        });
    }
    getItemHook(position, ...arg) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getCollectionHook(position, ...arg) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    postItemHook(position, ...arg) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    putItemHook(position, ...arg) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    deleteItemHook(position, ...arg) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getItem(value, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let relations = request.input('with', '');
            let body = Utilities_1.requestBody(request);
            yield this.getItemHook('START', value, body, relations);
            body = yield this.sanitize(body, 'get');
            yield this.getItemHook('AFTER-SANITIZE', value, body, relations);
            const validation = yield this.validate(body, 'get');
            yield this.getItemHook('AFTER-VALIDATE', value, body, relations);
            let result = yield this.getRepository().getItem(value);
            yield this.getItemHook('AFTER-PROCESS', result, relations);
            return this.getResponse().setStatus(200).item(result, relations);
        });
    }
    getCollection(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const relations = request.input('with', '');
            let body = Utilities_1.requestBody(request);
            yield this.getCollectionHook('START', body, relations);
            body = yield this.sanitize(body, 'get');
            yield this.getCollectionHook('AFTER-SANITIZE', body, relations);
            const validation = yield this.validate(body, 'get');
            yield this.getCollectionHook('AFTER-VALIDATE', body, relations);
            const result = yield this.getRepository().getCollection(body);
            yield this.getCollectionHook('AFTER-PROCESS', result, relations);
            return this.getResponse().setStatus(200).collection(result, relations);
        });
    }
    postItem(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const relations = request.input('with', '');
            let body = Utilities_1.requestBody(request);
            yield this.postItemHook('START', body, relations);
            body = yield this.sanitize(body, 'post');
            yield this.postItemHook('AFTER-SANITIZE', body, relations);
            const validation = yield this.validate(body, 'post');
            yield this.postItemHook('AFTER-VALIDATE', body, relations);
            body = yield this.fillProperties(body);
            const result = yield this.getRepository().postItem(body);
            yield this.postItemHook('AFTER-PROCESS', result, relations);
            return this.getResponse().setStatus(201).item(result, relations);
        });
    }
    postCollection(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const relations = request.input('with', '');
            const body = Utilities_1.requestBody(request);
            yield this.sanitize(body, 'post');
            yield this.validate(body, 'post');
            const result = yield this.getRepository().postCollection(body);
            return this.getResponse().setStatus(201).item(result, relations);
        });
    }
    putItem(value, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const relations = request.input('with', '');
            let body = Utilities_1.requestBody(request);
            yield this.putItemHook('START', value, body, relations);
            body = yield this.sanitize(body, 'put');
            yield this.putItemHook('AFTER-SANITIZE', value, body, relations);
            const validation = yield this.validate(body, 'put');
            yield this.putItemHook('AFTER-VALIDATE', value, body, relations);
            const result = yield this.getRepository().putItem(value, body);
            yield this.putItemHook('AFTER-PROCESS', result, relations);
            return this.getResponse().setStatus(200).item(result, relations);
        });
    }
    deleteItem(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.putItemHook('START', value);
            yield this.getRepository().deleteItem(value);
        });
    }
}
exports.RamenServices = RamenServices;
