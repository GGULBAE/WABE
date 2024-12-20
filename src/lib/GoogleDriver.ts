import { google, drive_v3 } from 'googleapis';
import { Credentials } from './GoogleAuth';
import { ReadStream, createWriteStream } from 'fs';

type Drive = drive_v3.Drive;

type DriveStorage = {
  limit: number,
  usage: number,
  usageInDrive: number
}

type UploadFileParams = {
  parentFolder: string,
  fileName: string,
  fileData: ReadStream
}

type DownloadFileParams = {
  fileName: string
}

class GoogleDriver {
  auth: Credentials;
  version: "v3" = "v3";
  drive: Drive;
  constructor(auth: Credentials) {
    this.auth = auth;
    this.drive = google.drive({ version: this.version, auth: this.auth });
  }

  async abouts(): Promise<DriveStorage | null> {
    const res = await this.drive.about.get({
      fields: 'storageQuota'
    });
    const storageQuota = res.data.storageQuota;

    if (storageQuota === undefined || storageQuota === null) {
      return null;
    }
    const result: DriveStorage = {
      limit: parseInt(storageQuota.limit || "0"),
      usage: parseInt(storageQuota.usage || "0"),
      usageInDrive: parseInt(storageQuota.usageInDrive || "0"),
    }

    return result;
  }
  
  async uploadFile({ fileName, fileData, parentFolder } : UploadFileParams) {
    const requestBody: drive_v3.Schema$File = {
      name: fileName,
      parents: [parentFolder]
    }
    const media = {
      mimeType: 'application/zip',
      body: fileData
    }
    try {
      const file = await this.drive.files.create({
        requestBody,
        media: media,
      });
    
      return file.data;
    } catch (err) {
      // TODO(developer) - Handle error
      throw err;
    }
  }

  async downloadFile(fileId: string, dest: string) {
    const drive = this.drive
    const fileRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' } // 파일을 스트림으로 받아옵니다.
    );
  
    const fileStream = fileRes.data as NodeJS.ReadableStream;
  
    // 파일 스트림을 지정한 경로에 저장
    const writeStream = createWriteStream(dest);
    fileStream.pipe(writeStream);
  
    return new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve();
      });
  
      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async makeFolder(folderName: string) {
    const requestBody: drive_v3.Schema$File = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    }
    
    try {
      const file = await this.drive.files.create({
        requestBody
      });
    
      return file.data;
    } catch (err) {
      // TODO(developer) - Handle error
      throw err;
    }
  }
  
  async findFolder(folderName: string) {
    const res = await this.drive.files.list({
      pageSize: 10,
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'nextPageToken, files(id, name)',
    });

    return res.data.files;
  }

  async listFiles(folderId: string) {
    const res = await this.drive.files.list({
      pageSize: 100,
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name)',
    });

    return res.data.files;
  }

  async deleteFile(fileId: string) {
    const res = await this.drive.files.update({
      fileId,
      requestBody: { trashed: true }
    });

    return res.data;
  }
}

export default GoogleDriver;