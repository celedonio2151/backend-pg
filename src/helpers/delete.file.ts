import * as fs from 'fs';
import * as path from 'path';

export function deleteFile(filePath: any, filename: string) {
  const fullFilePath = path.join(filePath, filename);
  if (fs.existsSync(fullFilePath)) {
    console.log('🚀 ~ deleteFile ~ eliminado:', fullFilePath);
    fs.unlinkSync(fullFilePath);
  }
}
