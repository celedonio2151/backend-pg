import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate } from 'src/helpers/formatDate';
import { InvoicePDF } from 'src/router/invoices/interfaces/interfacesBNB.ForQR';

export function invoiceBuilt(data: InvoicePDF): TDocumentDefinitions {
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
          { text: `${data.ci}`, fontSize: 11, width: 200 },
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
            text: `${data.name} ${data.surname}`,
            fontSize: 11,
            width: 200,
          },
          { text: `Nº Medidor:`, fontSize: 11, bold: true },
          { text: `${data.meter_number}`, alignment: 'right', fontSize: 11 },
        ],
        margin: [0, 2],
      },
      {
        columns: [
          { text: `Lectura Anterior:`, bold: true, fontSize: 11, width: 130 },
          {
            text: [
              {
                text: `${formatDate(data.beforeMonth.date, 'DD/MM/YYYY')}`,
                fontSize: 11,
              },
              {
                text: `       ${data.beforeMonth.value}`,
                fontSize: 11,
                bold: true,
              },
            ],
            width: 200,
          },
          { text: `Lectura Actual:`, fontSize: 11, bold: true, width: 75 },
          {
            text: [
              {
                text: `${formatDate(data.lasthMonth.date, 'DD/MM/YYYY')}`,
                fontSize: 11,
                alignment: 'right',
              },
              {
                text: `       ${data.lasthMonth.value}`,
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
              { text: 1, style: 'tableCell' },
              { text: formatDate(data.date, 'DD/MM/YYYY'), style: 'tableCell' },
              { text: data.beforeMonth.value, style: 'tableCell' },
              { text: data.lasthMonth.value, style: 'tableCell' },
              { text: data.cubicMeters, style: 'tableCell' },
              { text: data.balance, style: 'tableCell' },
            ],
            [
              { text: 2, style: 'tableCell' },
              { text: formatDate(data.date, 'DD/MM/YYYY'), style: 'tableCell' },
              { text: data.beforeMonth.value, style: 'tableCell' },
              { text: data.lasthMonth.value, style: 'tableCell' },
              { text: data.cubicMeters, style: 'tableCell' },
              { text: data.balance, style: 'tableCell' },
            ],
            [
              { text: 3, style: 'tableCell' },
              { text: formatDate(data.date, 'DD/MM/YYYY'), style: 'tableCell' },
              { text: data.beforeMonth.value, style: 'tableCell' },
              { text: data.lasthMonth.value, style: 'tableCell' },
              { text: data.cubicMeters, style: 'tableCell' },
              { text: data.balance, style: 'tableCell' },
            ],
            [
              { text: 4, style: 'tableCell' },
              { text: formatDate(data.date, 'DD/MM/YYYY'), style: 'tableCell' },
              { text: data.beforeMonth.value, style: 'tableCell' },
              { text: data.lasthMonth.value, style: 'tableCell' },
              { text: data.cubicMeters, style: 'tableCell' },
              { text: data.balance, style: 'tableCell' },
            ],
            [{}, {}, {}, {}, {}, {}],
            [
              {},
              {},
              {},
              {},
              {
                text: 'Total',
                fillColor: 'black',
                color: 'white',
                alignment: 'center',
                colSpan: 1,
                bold: true,
                style: 'tableCell',
              },
              {
                text: data.amountDue,
                style: 'tableCell',
                fillColor: 'black',
                color: 'white',
                bold: true,
              },
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
      tableCell: {
        fontSize: 11,
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
