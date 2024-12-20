"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const unzipper_1 = __importDefault(require("unzipper"));
class ZipManager {
    static async createZip(folders, outputPath) {
        // 출력 스트림 생성
        const output = fs.createWriteStream(outputPath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } }); // 압축 레벨 0-9 (최고 압축: 9)
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                console.log(`압축 완료! ${archive.pointer()} 바이트가 생성되었습니다.`);
                resolve();
            });
            archive.on('error', (err) => {
                reject(err);
            });
            // 압축 파일에 데이터를 기록
            archive.pipe(output);
            // 폴더들을 추가
            folders.forEach((folder) => {
                const folderName = path.basename(folder); // 폴더 이름
                archive.directory(folder, folderName); // 압축 파일 내 폴더 이름 유지
            });
            // 압축 종료
            archive.finalize();
        });
    }
    static async unzipFile(zipFilePath, outputDir) {
        const directory = await unzipper_1.default.Open.file(zipFilePath);
        return await directory.extract({ path: outputDir });
    }
}
exports.default = ZipManager;
//# sourceMappingURL=ZipManager.js.map