"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
class GoogleDriver {
    constructor(auth) {
        this.version = "v3";
        this.auth = auth;
        this.drive = googleapis_1.google.drive({ version: this.version, auth: this.auth });
    }
    async abouts() {
        const res = await this.drive.about.get({
            fields: 'storageQuota'
        });
        const storageQuota = res.data.storageQuota;
        if (storageQuota === undefined || storageQuota === null) {
            return null;
        }
        const result = {
            limit: parseInt(storageQuota.limit || "0"),
            usage: parseInt(storageQuota.usage || "0"),
            usageInDrive: parseInt(storageQuota.usageInDrive || "0"),
        };
        return result;
    }
    async uploadFile({ fileName, fileData, parentFolder }) {
        const requestBody = {
            name: fileName,
            parents: [parentFolder]
        };
        const media = {
            mimeType: 'application/zip',
            body: fileData
        };
        try {
            const file = await this.drive.files.create({
                requestBody,
                media: media,
            });
            return file.data;
        }
        catch (err) {
            // TODO(developer) - Handle error
            throw err;
        }
    }
    async downloadFile(fileId, dest) {
        const drive = this.drive;
        const fileRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' } // 파일을 스트림으로 받아옵니다.
        );
        const fileStream = fileRes.data;
        // 파일 스트림을 지정한 경로에 저장
        const writeStream = (0, fs_1.createWriteStream)(dest);
        fileStream.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                resolve();
            });
            writeStream.on('error', (err) => {
                reject(err);
            });
        });
    }
    async makeFolder(folderName) {
        const requestBody = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };
        try {
            const file = await this.drive.files.create({
                requestBody
            });
            return file.data;
        }
        catch (err) {
            // TODO(developer) - Handle error
            throw err;
        }
    }
    async findFolder(folderName) {
        const res = await this.drive.files.list({
            pageSize: 10,
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
            fields: 'nextPageToken, files(id, name)',
        });
        return res.data.files;
    }
    async listFiles(folderId) {
        const res = await this.drive.files.list({
            pageSize: 100,
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'nextPageToken, files(id, name)',
        });
        return res.data.files;
    }
    async deleteFile(fileId) {
        const res = await this.drive.files.update({
            fileId,
            requestBody: { trashed: true }
        });
        return res.data;
    }
}
exports.default = GoogleDriver;
//# sourceMappingURL=GoogleDriver.js.map