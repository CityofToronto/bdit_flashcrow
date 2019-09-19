import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import PDFDocument from 'pdfkit';

const TABLE_MIN_ROWS = 3;

class MovePDFDocument extends PDFDocument {
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
      columnSpacing: 15,
      rowSpacing: 5,
      usableWidth: this.page.width - this.page.margins.left - this.page.margins.right,
    };
    const tableOptions = Object.assign(defaultOptions, options);
    const {
      columnSpacing,
      rowSpacing,
      usableWidth,
    } = tableOptions;

    // OPTIONS NORMALIZATION
    const columnCount = headers.length;

    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth = columnContainerWidth - columnSpacing;
    const maxY = this.page.height - this.page.margins.bottom;

    let rowBottomY = 0;

    this.on('pageAdded', () => {
      // TODO: move this to class-level
      startY = this.page.margins.top;
      rowBottomY = 0;
    });

    // Check to have enough room for header and first rows
    const heightHeaders = this.computeRowHeight(headers, columnWidth, rowSpacing);
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

    rows.forEach((row) => {
      const rowText = headers.map(({ key }) => {
        if (row[key]) {
          return row[key].toString();
        }
        return '';
      });

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
      heightAxis: 36,
      widthAxis: 54,
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

    this.x = x;
    this.y = y + height;
    this.moveDown();
    return this;
  }

  availableWidth() {
    return this.page.width - this.page.margins.left - this.page.margins.right;
  }
}

export default MovePDFDocument;
