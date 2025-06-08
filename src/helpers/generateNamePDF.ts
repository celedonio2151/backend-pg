export function generateNamePDF() {
  const filename = new Date()
    .toLocaleString()
    .replace(/:/g, '_')
    .replace(/ /g, '_')
    .replace(/,/g, '_')
    .replace(/\//g, '_');

  return filename;
}
