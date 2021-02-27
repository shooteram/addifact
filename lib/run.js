"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = require("fs");
const https_1 = require("https");
const path_1 = require("path");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    let project = core.getInput('project'), hostname = core.getInput('hostname', { required: true }), port = core.getInput('port'), url = core.getInput('url', { required: true }), token = core.getInput('token', { required: true }), path = core.getInput('path', { required: true });
    if (!project) {
        project = 'test';
    }
    const form = new form_data_1.default();
    form.append('project', project);
    const files = fs_1.readdirSync(path);
    if (!files.length)
        core.error(`There is no files in "${path}" directory.`);
    files.map(file => form.append(file, fs_1.createReadStream(path_1.join(__dirname, '..', path, file))));
    const options = {
        hostname,
        method: 'POST',
        path: url,
        headers: Object.assign({ 'x-auth-token': token }, form.getHeaders()),
    };
    if (port !== '') {
        options.port = port;
        hostname = `${hostname}:${port}`;
    }
    const rq = https_1.request(options, rs => {
        if (rs.statusCode && (rs.statusCode >= 200 && rs.statusCode < 300)) {
            core.info(`Your files have been uploaded. Here are the links:\n${files.map(file => {
                return `\t - https://${hostname}/@${project}/${file}\n`;
            }).join('')}`);
        }
        else {
            core.error(`Something went wrong while sending the request (${rs === null || rs === void 0 ? void 0 : rs.statusCode})`);
        }
    });
    rq.on('error', e => { core.error(e); });
    form.pipe(rq).on('finish', () => rq.end());
});
run().catch(core.setFailed);
