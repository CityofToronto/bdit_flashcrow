import csvStringify from 'csv-stringify';

class FormatGenerator {
  static csvTimestamp(t) {
    return t.toISOString().slice(0, 16).replace('T', ' ');
  }

  static csv({ columns, rows }) {
    return csvStringify(rows, {
      cast: {
        date: FormatGenerator.csvTimestamp,
      },
      columns,
      header: true,
    });
  }

  static excel(excelLayout) {
    // TODO: implement this
    return excelLayout;
  }

  static pdf(pdfLayout) {
    // TODO: implement this
    return pdfLayout;
  }
}

export default FormatGenerator;
