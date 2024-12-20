"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
class GoogleAuth {
    constructor() {
        this.SCOPES = ['https://www.googleapis.com/auth/drive'];
        this.TOKEN_PATH = path.join(process.cwd(), '.credentials', 'token.json');
        this.CREDENTIALS_PATH = path.join(process.cwd(), '.credentials', 'credentials.json');
    }
    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(this.TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        }
        catch (err) {
            return null;
        }
    }
    async saveCredentials(client) {
        const content = await fs.readFile(this.CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(this.TOKEN_PATH, payload);
    }
    async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: this.SCOPES,
            keyfilePath: this.CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await this.saveCredentials(client);
        }
        return client;
    }
}
exports.default = GoogleAuth;
//# sourceMappingURL=GoogleAuth.js.map