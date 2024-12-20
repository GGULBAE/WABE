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
const GoogleAuth_1 = __importDefault(require("./GoogleAuth"));
const GoogleDriver_1 = __importDefault(require("./GoogleDriver"));
const WOW_1 = __importDefault(require("./WOW"));
const path = __importStar(require("path"));
const ZipManager_1 = __importDefault(require("./ZipManager"));
class Core {
    constructor() {
        this.client = null;
        this.driver = null;
    }
    async init() {
        // 유저 인증
        const auth = new GoogleAuth_1.default();
        this.client = await auth.authorize();
        this.driver = new GoogleDriver_1.default(this.client);
    }
    // 애드온을 백업한다.
    // 1. 컴퓨터에 존재하는 와우 폴더 검색
    // 2. 와우 폴더 내 애드온 설정 파일, 계정 정보 파일들을 압축
    // 3. [WABE]Storage 를 구글 드라이브에서 검색
    // 3-1. 없는 경우 폴더 생성
    // 3-2. 하위에 zip 파일이 있는지 확인하고, 삭제 하기.
    // 4. [WABE]Storage 폴더에 zip 파일을 업로드
    async BackUpAddons(load_status) {
        // 1. 컴퓨터에 존재하는 와우 폴더 검색
        load_status("와우 폴더 불러오기 시작");
        const WOWPaths = await WOW_1.default.getTargetPath();
        load_status("와우 폴더 불러오기 완료");
        // 2. 와우 폴더 내 애드온 설정 파일, 계정 정보 파일들을 압축
        const addonZipFilePath = path.join(process.cwd(), 'temp', 'backup-temp.zip');
        load_status("압축시작 - " + addonZipFilePath);
        await ZipManager_1.default.createZip([WOWPaths.WTF, WOWPaths.fonts, WOWPaths.interface], addonZipFilePath);
        load_status("압축완료");
        // 3. [WABE]Storage 를 구글 드라이브에서 검색
        load_status("구글드라이브 조회");
        const storage = await this.driver?.findFolder("[WABE]Storage");
        if (!storage) {
            return;
        }
        var storageId = '';
        // 3-1. 없는 경우 폴더 생성
        if (storage.length === 0) {
            load_status("구글드라이브 폴더 생성 시작");
            const res = await this.driver?.makeFolder("[WABE]Storage");
            if (res?.id == undefined)
                return;
            storageId = res.id;
            load_status("구글드라이브 폴더 생성 완료");
        }
        else {
            if (storage[0].id == undefined)
                return;
            storageId = storage[0].id;
            console.log("Storage Exists!");
        }
        load_status("구글드라이브 폴더 조회 완료 " + storageId);
        // 3-2. 하위에 zip 파일이 있는지 확인하고, 삭제 하기.
        load_status("구글드라이브 기존 파일 확인");
        const files = await this.driver?.listFiles(storageId);
        if (files === undefined)
            return;
        if (files.length > 0) {
            load_status("구글드라이브 기존 파일 삭제");
            for (var i = 0; i < files.length; i++) {
                const target = files[i];
                if (target.id === undefined || target.id === null)
                    return;
                const res = await this.driver?.deleteFile(target.id);
            }
        }
        load_status("구글드라이브 기존 파일 삭제 " + files.length + " 개 삭제 완료");
        // 4. [WABE]Storage 폴더에 zip 파일을 업로드
        load_status("업로드 시작");
        const backUpData = {
            fileName: "testUpload.zip",
            parentFolder: storageId,
            fileData: fs.createReadStream(addonZipFilePath)
        };
        await this.driver?.uploadFile(backUpData);
        load_status("업로드 완료");
    }
    // 애드온을 복구한다.
    // 1. 컴퓨터에 존재하는 와우 폴더 검색
    // 2. [WABE]Storage 를 구글 드라이브에서 검색
    // 3. [WABE]Storage 폴더에 있는 zip 파일 중 가장 최신 파일을 다운로드 및 압축해제
    // 4. 압축해제 된 파일을 적절하게 폴더에 copy 하기
    async RestoreAddons(load_status) {
        // 1. 컴퓨터에 존재하는 와우 폴더 검색
        load_status("와우 폴더 불러오기 시작");
        const WOWPaths = await WOW_1.default.getTargetPath();
        load_status("와우 폴더 불러오기 완료");
        // 2. [WABE]Storage 를 구글 드라이브에서 검색
        load_status("구글드라이브 조회");
        const storage = await this.driver?.findFolder("[WABE]Storage");
        if (!storage) {
            return;
        }
        var storageId = '';
        if (storage[0].id == undefined)
            return;
        storageId = storage[0].id;
        load_status("구글드라이브 폴더 조회 완료 " + storageId);
        const files = await this.driver?.listFiles(storageId);
        if (files === undefined)
            return;
        load_status("백업파일 다운로드 시작 ");
        const targetDir = path.join(process.cwd(), 'temp', 'backup-downloaded.zip');
        const target = files[0];
        if (target.id === undefined || target.id === null)
            return;
        if (files.length > 0) {
            await this.driver?.downloadFile(target.id, targetDir);
        }
        load_status("백업파일 다운로드 완료 ");
        load_status("불러오기 시작");
        await ZipManager_1.default.unzipFile(targetDir, WOWPaths.root);
        load_status("불러오기 완료");
    }
}
exports.default = Core;
//# sourceMappingURL=Core.js.map