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
    // console.log(file, name, hash);
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
    console.log(params);
    const { fileName, format } = params;
    // 合并指定名称的切片
    const files = fs
      .readdirSync(`${UPLOAD_DIR}/${fileName}`)
      .sort((a, b) => Number(a) - Number(b));
    // console.log(files, 'files');
    // 合并文件
    await this.mergeChunk(files, fileName, format);
    return 'merge success!';
  }

  async mergeChunk(files, fileName, format) {
    await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve, reject) => {
          // 先读取到文件
          const buffer = fs.readFileSync(`${UPLOAD_DIR}/${fileName}/${file}`);
          // 追加合并到新的
          fs.appendFile(
            UPLOAD_FILE_DIR + '/' + fileName + format,
            buffer,
            (err) => {
              if (err) throw err;
              resolve('');
            },
          );
        });
      }),
    );
    // 合并成功后删除temp目录下的文件
    await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve, reject) => {
          // 删除切片
          // 追加合并到新的
          fs.rm(`${UPLOAD_DIR}/${fileName}/${file}`, {}, (err) => {
            if (err) throw err;
            resolve('');
          });
        });
      }),
    );
    // 删除目录
    await fs.rmdir(`${UPLOAD_DIR}/${fileName}`);
  }
}
