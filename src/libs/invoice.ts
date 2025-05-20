import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from 'src/helpers/formatDate';
import { Invoice } from 'src/router/invoices/entities/invoice.entity';

const { _id, amountDue, isPaid, status, createdAt, updatedAt, meterReading } = {
  _id: 10,
  amountDue: 20,
  isPaid: true,
  status: true,
  createdAt: '2024-08-28T05:56:34.612Z',
  updatedAt: '2024-08-28T15:40:09.000Z',
  meterReading: {
    _id: 10,
    date: '2024-02-10T12:56:20.000Z',
    beforeMonth: {
      date: '2024-01-20T12:56:20.000Z',
      meterValue: 5,
    },
    lastMonth: {
      date: '2024-02-10T12:56:20.000Z',
      meterValue: 10,
    },
    cubicMeters: 5,
    balance: 20,
    meterImage: null,
    description: null,
    waterMeterId: 1,
    createdAt: '2024-08-14T13:02:01.701Z',
    updatedAt: '2024-08-14T13:02:01.701Z',
  },
};

export function invoiceBuilt(data: any): TDocumentDefinitions {
  const logoPath = 'src/assets/logoAgua.png';
  const invoice: TDocumentDefinitions = {
    watermark: {
      text: 'Cancelado',
      fontSize: 75,
      bold: true,
      angle: 45,
      color: 'red',
      opacity: 0.3,
    },
    pageMargins: 40,
    header: {
      text: 'I love you',
      alignment: 'right',
      margin: 10,
    },
    content: [
      {
        columns: [
          { image: logoPath, width: 80, alignment: 'center' },
          {
            text: 'COMITE DE AGUA POTABLE MOSOJ LLAJTA',
            alignment: 'right',
            style: 'header',
            margin: [0, 30, 0, 0],
          },
        ],
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', '*'],
          body: [
            [
              { text: 'COMUNIDAD: MOSOJ LLAJTA', style: 'tableHeader' },
              {
                text: 'COMUNIDAD DE AGUA POTABLE Y SANEAMIENTO',
                style: 'tableHeader',
                alignment: 'right',
              },
            ],
          ],
        },
        margin: [0, 10, 0, 0],
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto'],
          body: [
            [
              { text: 'CENTRALIA: TOTACOA', style: 'tableHeader' },
              { text: 'MUNICIPIO: YOTALA', style: 'tableHeader' },
              { text: 'RECIBO DE PAGO', style: 'tableHeader' },
              {
                text: `Nro 1548568`,
                style: 'tableHeader',
                alignment: 'right',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 4],
      },
      // Datos personales y de medidor
      {
        columns: [
          { text: `CI:`, fontSize: 11, bold: true, width: 130 },
          { text: `12504550`, fontSize: 11, width: 200 },
          { text: `Fecha:`, fontSize: 11, bold: true, width: 40 },
          {
            text: `${formatDate(new Date(), 'DD/MM/YYYY   hh:mm:ss')}`,
            alignment: 'right',
            fontSize: 11,
          },
        ],
        margin: [0, 2],
      },
      {
        columns: [
          {
            text: `Nombre/Razon Social:`,
            fontSize: 11,
            bold: true,
            width: 130,
          },
          {
            text: `Oscar Fernando Vaca Carrasco Vedia`,
            fontSize: 11,
            width: 200,
          },
          { text: `Nº Medidor:`, fontSize: 11, bold: true },
          { text: `71588952`, alignment: 'right', fontSize: 11 },
        ],
        margin: [0, 2],
      },
      {
        columns: [
          { text: `Lectura Anterior:`, bold: true, fontSize: 11, width: 130 },
          {
            text: [
              { text: `${formatDate(new Date(), 'DD/MM/YYYY')}`, fontSize: 11 },
              { text: `       1250088`, fontSize: 11, bold: true },
            ],
            width: 200,
          },
          { text: `Lectura Actual:`, fontSize: 11, bold: true, width: 75 },
          {
            text: [
              {
                text: `${formatDate(new Date(), 'DD/MM/YYYY')}`,
                fontSize: 11,
                alignment: 'right',
              },
              {
                text: `       1270089`,
                fontSize: 11,
                alignment: 'right',
                bold: true,
              },
            ],
          },
        ],
        margin: [0, 2, 0, 0],
      },
      // {
      //   columns: [
      //     { text: `Pagado: ${isPaid ? 'Sí' : 'No'}` },
      //     { text: `Estado: ${status ? 'Activo' : 'Inactivo'}` },
      //     { text: `Fecha de creación: ${createdAt}` },
      //     { text: `Última actualización: ${updatedAt}` },
      //   ],
      //   margin: [0, 20, 0, 20],
      // },
      {
        text: 'Detalle de Lectura del Medidor',
        style: 'subheader',
        margin: [0, 10, 0, 5],
      },
      // ===============  Tabla de comsumo por mes  ===============
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', '*', '*', '*'],
          body: [
            [
              { text: 'Nro', style: 'tableHeader' },
              { text: 'Fecha', style: 'tableHeader' },
              { text: 'Antes (m³)', style: 'tableHeader' },
              { text: 'Después (m³)', style: 'tableHeader' },
              { text: 'Consumo (m³)', style: 'tableHeader' },
              { text: 'Saldo (Bs)', style: 'tableHeader' },
            ],
            [
              1,
              formatDate(meterReading.date, 'DD/MM/YYYY'),
              meterReading.beforeMonth?.meterValue ?? '',
              meterReading.lastMonth?.meterValue ?? '',
              meterReading.cubicMeters ?? '',
              meterReading.balance ?? '',
            ],
            [
              2,
              formatDate(meterReading.date, 'DD/MM/YYYY'),
              meterReading.beforeMonth?.meterValue ?? '',
              meterReading.lastMonth?.meterValue ?? '',
              meterReading.cubicMeters ?? '',
              meterReading.balance ?? '',
            ],
            [
              2,
              formatDate(meterReading.date, 'DD/MM/YYYY'),
              meterReading.beforeMonth?.meterValue ?? '',
              meterReading.lastMonth?.meterValue ?? '',
              meterReading.cubicMeters ?? '',
              meterReading.balance ?? '',
            ],
          ],
        },
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true },
      tableHeader: {
        bold: true,
        fillColor: '#eeeeee',
        fontSize: 12,
        margin: 4,
        alignment: 'center',
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
    pageSize: 'LETTER',
  };
  return invoice;
}

// const docDefinition: TDocumentDefinitions = {
//   content: [
//     {
//       columns: [
//         {
//           image: logoPath,
//           width: 80,
//           margin: [0, 0, 10, 0],
//         },
//         {
//           text: 'RECIBO DE PAGO',
//           style: 'header',
//           alignment: 'center',
//           margin: [0, 20, 0, 0],
//         },
//       ],
//     },
//     {
//       columns: [
//         { text: `ID Recibo: ${invoice._id}`, style: 'subheader' },
//         { text: `Monto a pagar: ${amountDue} Bs` },
//         { text: `Pagado: ${isPaid ? 'Sí' : 'No'}` },
//         { text: `Estado: ${status ? 'Activo' : 'Inactivo'}` },
//         { text: `Fecha de creación: ${createdAt}` },
//         { text: `Última actualización: ${updatedAt}` },
//       ],
//       margin: [0, 0, 0, 20],
//     },
//     {
//       text: 'Detalle de Lectura del Medidor',
//       style: 'subheader',
//       margin: [0, 10, 0, 10],
//     },
//     {
//       table: {
//         headerRows: 1,
//         widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
//         body: [
//           [
//             { text: 'Fecha', style: 'tableHeader' },
//             { text: 'Antes (m³)', style: 'tableHeader' },
//             { text: 'Después (m³)', style: 'tableHeader' },
//             { text: 'Consumo (m³)', style: 'tableHeader' },
//             { text: 'Saldo (Bs)', style: 'tableHeader' },
//           ],
//           [
//             meterReading.date
//               ? new Date(meterReading.date).toLocaleDateString()
//               : '',
//             meterReading.beforeMonth?.meterValue ?? '',
//             meterReading.lastMonth?.meterValue ?? '',
//             meterReading.cubicMeters ?? '',
//             meterReading.balance ?? '',
//           ],
//         ],
//       },
//       layout: 'lightHorizontalLines',
//     },
//   ],
//   styles: {
//     header: { fontSize: 18, bold: true },
//     subheader: { fontSize: 14, bold: true },
//     tableHeader: { bold: true, fillColor: '#eeeeee' },
//   },
//   defaultStyle: {
//     font: 'Roboto',
//   },
//   pageSize: 'LETTER',
// };
