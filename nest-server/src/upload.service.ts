import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
interface FileType {
  name: string;
  hash: string;
}
const UPLOAD_DIR = path.resolve(__dirname, '..', 'temp');
const UPLOAD_FILE_DIR = path.resolve(__dirname, '..', 'files');
@Injectable()
export class UploadService {
  async upload(file, data: FileType): Promise<any> {
    const { name, hash } = data;
    const _path = `${UPLOAD_DIR}/${name}/${hash}`;
    console.log(_path, '_path');
    await fs.ensureDir(`${UPLOAD_DIR}/${name}`).then(() => {
      fs.writeFile(_path, file.buffer, (err) => {
        if (err) throw err;
        console.log('the file has saved!');
      });
    });
    return 'the file has saved!';
  }

  async merge(params) {
    const { fileName, format } = params;
    // 合并指定名称的切片
    const files = fs
      .readdirSync(`${UPLOAD_DIR}/${fileName}`)
      .sort((a, b) => Number(a) - Number(b));
    // 合并文件
    await this.mergeChunk(files, fileName, format);
    await this.deleteChunk(files, fileName);
    return 'merge success!';
  }
  async mergeChunk(files, fileName, format) {
    // await Promise.all(
    //   files.map((file, index) => {
    //     return new Promise(async (resolve, reject) => {
    //       // 先读取到文件
    //       await fs
    //         .readFile(`${UPLOAD_DIR}/${fileName}/${file}`)
    //         .then((buffer) => {
    //           // 追加合并到新的
    //           fs.appendFile(
    //             UPLOAD_FILE_DIR + "/" + fileName + format,
    //             buffer,
    //             (err) => {
    //               if (err) throw err;
    //               resolve("");
    //             }
    //           );
    //         });
    //     });
    //   })
    // );
  }

  async deleteChunk(files, fileName) {
    // 合并成功后删除temp目录下的文件
    await Promise.all(
      files.map(async (file) => {
        return await new Promise(async (resolve, reject) => {
          // 删除切片
          await fs.rm(`${UPLOAD_DIR}/${fileName}/${file}`, {}, (err) => {
            if (err) throw err;
            resolve('');
          });
        });
      }),
    );
    // 删除目录
    await fs.rmdirSync(`${UPLOAD_DIR}/${fileName}`);
  }
}
