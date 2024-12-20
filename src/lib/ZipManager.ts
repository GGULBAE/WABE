import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';

class ZipManager {

  static async createZip(folders: string[], outputPath: string) {
    // 출력 스트림 생성
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // 압축 레벨 0-9 (최고 압축: 9)
  
    return new Promise<void>((resolve, reject) => {
        output.on('close', () => {
            console.log(`압축 완료! ${archive.pointer()} 바이트가 생성되었습니다.`);
            resolve();
        });
  
        archive.on('error', (err: any) => {
            reject(err);
        });
  
        // 압축 파일에 데이터를 기록
        archive.pipe(output);
  
        // 폴더들을 추가
        folders.forEach((folder: string) => {
            const folderName = path.basename(folder); // 폴더 이름
            archive.directory(folder, folderName); // 압축 파일 내 폴더 이름 유지
        });
  
        // 압축 종료
        archive.finalize();
    });
  }

  static async unzipFile(zipFilePath: string, outputDir: string) {
    const directory = await unzipper.Open.file(zipFilePath);

    return await directory.extract({ path: outputDir });
  }
}

export default ZipManager;