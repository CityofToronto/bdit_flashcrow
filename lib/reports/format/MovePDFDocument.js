import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import PDFDocument from 'pdfkit';

import { noop } from '@/lib/FunctionUtils';

const TABLE_MIN_ROWS = 3;

/**
 * Subclass of PDFKit's `PDFDocument` that adds extra functionality for handling
 * tables and charts.
 *
 * @param {Object} options - `PDFDocument` options
 */
class MovePDFDocument extends PDFDocument {
  constructor(options) {
    super(options);

    /*
     * Prevent errors if we call `.heightOfString()` before `.text()`.
     */
    this.x = 0;
    this.y = 0;
  }

  /*
   * Compute row height using `.heightOfString()`.  The row height is the height
   * of the tallest string in the row plus the `rowSpacing`.
   *
   * For more details, see:
   *
   * https://pdfkit.org/docs/text.html#text_measurements
   */
  computeRowHeight(row, columnWidth, rowSpacing) {
    let result = 0;

    row.forEach((cell) => {
      const cellHeight = this.heightOfString(cell, {
        width: columnWidth,
        align: 'left',
      });
      result = Math.max(result, cellHeight);
    });

    return result + rowSpacing;
  }

  /**
   * @see https://www.andronio.me/2017/09/02/pdfkit-tables/
   */
  table({ headers, rows }, x, y, options) {
    // ARGUMENTS NORMALIZATION
    const startX = x;
    let startY = y;

    const defaultOptions = {
      beforeHeader: noop,
      beforeRow: noop,
      columnSpacing: 15,
      rowSpacing: 5,
      usableWidth: this.page.width - 2 * this.page.margins,
    };
    const tableOptions = Object.assign(defaultOptions, options);
    const {
      beforeHeader,
      beforeRow,
      columnSpacing,
      rowSpacing,
      usableWidth,
    } = tableOptions;

    // OPTIONS NORMALIZATION
    const columnCount = headers.length;

    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth = columnContainerWidth - columnSpacing;
    const maxY = this.page.height - this.page.margins;

    let rowBottomY = 0;

    this.on('pageAdded', () => {
      // TODO: move this to class-level
      startY = this.page.margins.top;
      rowBottomY = 0;
    });

    // Allow user to override style for header
    beforeHeader();

    // Check to have enough room for header and first rows
    const headerText = headers.map(({ text }) => text);
    const heightHeaders = this.computeRowHeight(headerText, columnWidth, rowSpacing);
    if (startY + TABLE_MIN_ROWS * heightHeaders > maxY) {
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
    rowBottomY = Math.max(startY + heightHeaders, rowBottomY);

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

      // Allow user to override style for rows
      beforeRow(row, i);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider `TABLE_MIN_ROWS` rows margin
      const rowHeight = this.computeRowHeight(rowText, columnWidth, rowSpacing);
      if (startY + TABLE_MIN_ROWS * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
      }

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
      const sepY = rowBottomY - rowSpacing / 2;
      this
        .moveTo(startX, sepY)
        .lineTo(startX + usableWidth, sepY)
        .lineWidth(1)
        .stroke();
    });

    this.x = startX;
    this.moveDown();

    return this;
  }

  chart(chartData, x, y, width, height, options) {
    // TODO: DRY some of this with `FcChartAtrVolume24h`

    // OPTIONS NORMALIZATION
    const defaultOptions = {
      beforeAxisLabels: noop,
      beforeAxisTicks: noop,
      beforeBars: noop,
      beforeTitle: noop,
      heightAxis: 48,
      heightTitle: 48,
      widthAxis: 48,
      labelAxisX: null,
      labelAxisY: null,
      title: null,
    };
    const chartOptions = Object.assign(defaultOptions, options);
    const {
      beforeAxisLabels,
      beforeAxisTicks,
      beforeBars,
      beforeTitle,
      heightAxis,
      heightTitle,
      labelAxisX,
      labelAxisY,
      widthAxis,
      title,
    } = chartOptions;
    const widthBars = width - widthAxis;
    const heightBars = height - heightTitle - heightAxis;

    // AXES
    const scaleX = scaleBand()
      .range([widthAxis, width])
      .padding(0.1);
    const scaleY = scaleLinear()
      .range([height - heightAxis, heightTitle]);
    const axisX = axisBottom(scaleX)
      .tickSize(0)
      .tickPadding(8);
    const axisY = axisLeft(scaleY)
      .tickSize(0)
      .tickPadding(8);

    this.save();
    this.translate(x, y);

    // CHART TITLE
    beforeTitle();
    if (title !== null) {
      this.text(title, 0, 0, {
        align: 'center',
        width,
      });
    }

    // AXIS LABELS
    beforeAxisLabels();
    if (labelAxisX !== null) {
      const optionsLabelAxisX = {
        align: 'center',
        width: widthBars,
      };
      const heightLabelAxisX = this.heightOfString(labelAxisX, optionsLabelAxisX);
      this.text(labelAxisX, widthAxis, height - heightLabelAxisX, optionsLabelAxisX);
    }
    if (labelAxisY !== null) {
      this
        .save()
        .translate(0, heightTitle + heightBars / 2)
        .rotate(-90)
        .text(labelAxisY, -heightBars / 2, 0, {
          align: 'center',
          width: heightBars,
        })
        .restore();
    }

    // CHART RENDERING
    scaleX.domain([...chartData.keys()]);
    scaleY.domain([0, max(chartData)]);

    beforeBars();
    chartData.forEach((value, i) => {
      const xBar = scaleX(i);
      const yBar = scaleY(value);
      const widthBar = scaleX.bandwidth();
      const heightBar = height - heightAxis - yBar;
      this
        .rect(xBar, yBar, widthBar, heightBar)
        .fill();
    });

    beforeAxisTicks();
    chartData.forEach((_, i) => {
      const xTick = scaleX(i);
      const yTick = height - heightAxis;
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
      const xTick = 0;
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

    // undo: translate(x, y)
    this.restore();

    this.x = x;
    this.y = y + height;
    this.moveDown();
    return this;
  }
}

export default MovePDFDocument;
