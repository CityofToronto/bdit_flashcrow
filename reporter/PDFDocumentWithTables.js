import PDFDocument from 'pdfkit';

function noop() {}

/**
 * @see https://www.andronio.me/2017/09/02/pdfkit-tables/
 */
class PDFDocumentWithTables extends PDFDocument {
  table(table, arg0, arg1, arg2) {
    // ARGUMENTS NORMALIZATION
    let startX = this.page.margins.left;
    let startY = this.y;
    let options = {};

    if ((typeof arg0 === 'number') && (typeof arg1 === 'number')) {
      startX = arg0;
      startY = arg1;

      if (typeof arg2 === 'object') {
        options = arg2;
      }
    } else if (typeof arg0 === 'object') {
      options = arg0;
    }

    // OPTIONS NORMALIZATION
    const columnCount = table.headers.length;
    const columnSpacing = options.columnSpacing || 15;
    const rowSpacing = options.rowSpacing || 5;
    const defaultUsableWidth = this.page.width - this.page.margins.left - this.page.margins.right;
    const usableWidth = options.width || defaultUsableWidth;

    const prepareHeader = options.prepareHeader || noop;
    const prepareRow = options.prepareRow || noop;

    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth = columnContainerWidth - columnSpacing;
    const maxY = this.page.height - this.page.margins.bottom;

    /*
     * Compute row height using `.heightOfString()`.  The row height is the height
     * of the tallest string in the row plus the `rowSpacing`.
     *
     * For more details, see:
     *
     * https://pdfkit.org/docs/text.html#text_measurements
     */
    const computeRowHeight = (row) => {
      let result = 0;

      row.forEach((cell) => {
        const cellHeight = this.heightOfString(cell, {
          width: columnWidth,
          align: 'left',
        });
        result = Math.max(result, cellHeight);
      });

      return result + rowSpacing;
    };

    let rowBottomY = 0;

    this.on('pageAdded', () => {
      startY = this.page.margins.top;
      rowBottomY = 0;
    });

    // Allow the user to override style for headers
    prepareHeader();

    // Check to have enough room for header and first rows
    if (startY + 3 * computeRowHeight(table.headers) > maxY) {
      this.addPage();
    }

    // Print all headers
    table.headers.forEach(({ text }, j) => {
      this.text(text, startX + j * columnContainerWidth, startY, {
        width: columnWidth,
        align: 'left',
      });
    });

    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(2)
      .stroke();

    table.rows.forEach((row, i) => {
      const rowText = table.headers.map(({ key }) => {
        if (row[key]) {
          return row[key].toString();
        }
        return '';
      });
      console.log(row, table.headers, rowText);
      const rowHeight = computeRowHeight(rowText);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
      }

      // Allow the user to override style for rows
      prepareRow(row, i);

      // Print all cells of the current row
      rowText.forEach((text, j) => {
        this.text(text, startX + j * columnContainerWidth, startY, {
          width: columnWidth,
          align: 'left',
        });
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(1)
        .opacity(0.7)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();

    return this;
  }
}

export default PDFDocumentWithTables;
