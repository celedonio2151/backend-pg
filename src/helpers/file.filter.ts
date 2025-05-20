import { BadRequestException } from '@nestjs/common';
import { mkdirSync } from 'fs';
import path from 'path';
import { cwd } from 'process';

// export function fileFilter(req, file, callback) {
//   if (!file.originalname.match(/\.(jpeg|jpg|png|gif)$/)) {
//     return callback(new Error(`Invalid format type`), false);
//   } else {
//     callback(
//       new BadRequestException(
//         'Solo se permiten archivos de imagen (JPEG, PNG, GIF)',
//       ),
//       false,
//     );
//   }
//   callback(null, true);
// }

export function fileFilter(req, file: Express.Multer.File, callback) {
  // Verificar si el archivo es una imagen
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException('Images file allowed are (JPEG, PNG, GIF)'),
      false,
    );
  }
}

export function fileRename(req, file: Express.Multer.File, cb) {
  const uniqueSuffix = Date.now(); // Genera un sufijo único
  const orifinalName = file.originalname.replace(/\s/g, '_');
  const filename = `${uniqueSuffix}-${orifinalName}`;
  cb(null, filename);
}

export function profileImgFilePath() {
  const pahtImg = `public/profileImgs`;
  return pahtImg;
}
