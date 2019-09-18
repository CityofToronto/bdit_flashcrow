import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import PDFDocument from 'pdfkit';

function noop() {}

class MovePDFDocument extends PDFDocument {
  /**
   * @see https://www.andronio.me/2017/09/02/pdfkit-tables/
   */
  table({ headers, rows }, arg0, arg1, arg2) {
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
    const columnCount = headers.length;
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
    if (startY + 3 * computeRowHeight(headers) > maxY) {
      this.addPage();
    }

    // Print all headers
    headers.forEach(({ text }, j) => {
      this.text(text, startX + j * columnContainerWidth, startY, {
        width: columnWidth,
        align: 'left',
      });
    });

    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(headers), rowBottomY);

    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(2)
      .stroke();

    rows.forEach((row, i) => {
      const rowText = headers.map(({ key }) => {
        if (row[key]) {
          return row[key].toString();
        }
        return '';
      });
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

  chart(chartData, x, y, width, height, options) {
    // TODO: DRY some of this with `FcChartAtrVolume24h`

    // OPTIONS NORMALIZATION
    const defaultOptions = {
      heightAxis: 64,
      widthAxis: 80,
      labelX: null,
      labelY: null,
      title: null,
    };
    const chartOptions = Object.assign(defaultOptions, options);
    const {
      heightAxis,
      labelX,
      labelY,
      widthAxis,
    } = chartOptions;
    const heightBars = height - heightAxis;

    // AXES
    const scaleX = scaleBand()
      .range([widthAxis, width])
      .padding(0.1);
    const scaleY = scaleLinear()
      .range([heightBars, 0]);
    const axisX = axisBottom(scaleX)
      .tickSize(0)
      .tickPadding(8);
    const axisY = axisLeft(scaleY)
      .tickSize(0)
      .tickPadding(8);

    // AXIS LABELS
    if (labelX !== null) {
      // TODO: this
    }
    if (labelY !== null) {
      // TODO: this
    }

    // CHART RENDERING
    scaleX.domain([...chartData.keys()]);
    scaleY.domain([0, max(chartData)]);

    this.save();
    this.translate(x, y);

    chartData.forEach((value, i) => {
      const xBar = scaleX(i);
      const yBar = scaleY(value);
      const widthBar = scaleX.bandwidth();
      const heightBar = heightBars - yBar;
      console.log(xBar, yBar, widthBar, heightBar);
      this
        .rect(xBar, yBar, widthBar, heightBar)
        .fill('#71767a');
    });

    chartData.forEach((_, i) => {
      const xTick = scaleX(i);
      const yTick = heightBars;
      const widthBar = scaleX.bandwidth();
      const heightTick = axisX.tickSize();
      const paddingTick = axisX.tickPadding();

      if (heightTick > 0) {
        this
          .moveTo(xTick, yTick)
          .lineTo(xTick, yTick + heightTick)
          .stroke();
      }

      this.text(i, xTick, yTick + heightTick + paddingTick, {
        align: 'center',
        width: widthBar,
      });
    });

    const yTicks = axisY.tickValues() || axisY.scale().ticks();
    yTicks.forEach((value) => {
      const xTick = widthAxis;
      const yTick = scaleY(value);
      const widthTick = axisY.tickSize();
      const paddingTick = axisY.tickPadding();

      if (widthTick > 0) {
        this
          .moveTo(xTick, yTick)
          .lineTo(xTick - widthTick, yTick)
          .stroke();
      }

      this.text(value, 0, yTick, {
        align: 'right',
        width: widthAxis - widthTick - paddingTick,
      });
    });

    this.restore();

    this.moveDown();
    return this;
  }
}

export default MovePDFDocument;
