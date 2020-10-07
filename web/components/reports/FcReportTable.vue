<template>
  <div class="fc-report-table">
    <h2 v-if="title">{{title}}</h2>
    <table
      class="my-2"
      :class="{ 'auto-width': autoWidthTable }">
      <caption
        v-if="caption"
        class="font-size-m my-2 text-left">
        {{caption}}
      </caption>
      <colgroup v-if="colgroup.length > 0">
        <col
          v-for="({ attrs }, c) in colgroup"
          :key="'col_' + c"
          v-bind="attrs" />
      </colgroup>
      <thead v-if="header.length > 0">
        <tr
          v-for="(row, r) in headerNormalized"
          :key="'row_header_' + r">
          <component
            v-for="({ attrs, tag, value }, c) in row"
            :key="'cell_header_' + r + '_' + c"
            :is="tag"
            v-bind="attrs">
            <v-icon v-if="value === true">mdi-check</v-icon>
            <v-icon v-else-if="value === false">mdi-close</v-icon>
            <span v-else-if="value === null">&nbsp;</span>
            <span v-else>{{value}}</span>
          </component>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, r) in bodyNormalized"
          :key="'row_body_' + r">
          <component
            v-for="({ attrs, tag, value }, c) in row"
            :key="'cell_body_' + r + '_' + c"
            :is="tag"
            v-bind="attrs">
            <v-icon v-if="value === true">mdi-check</v-icon>
            <v-icon v-else-if="value === false">mdi-close</v-icon>
            <span v-else-if="value === null">&nbsp;</span>
            <span v-else>{{value}}</span>
          </component>
        </tr>
      </tbody>
      <tfoot v-if="footer.length > 0">
        <tr
          v-for="(row, r) in footerNormalized"
          :key="'row_footer_' + r">
          <component
            v-for="({ attrs, tag, value }, c) in row"
            :key="'cell_footer_' + r + '_' + c"
            :is="tag"
            v-bind="attrs">
            <v-icon v-if="value === true">mdi-check</v-icon>
            <v-icon v-else-if="value === false">mdi-close</v-icon>
            <span v-else-if="value === null">&nbsp;</span>
            <span v-else>{{value}}</span>
          </component>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import TableUtils from '@/lib/reports/format/TableUtils';

function getClassListForStyle(style) {
  const {
    alignment,
    bold,
    bt,
    bl,
    bb,
    br,
    fontSize,
    muted,
    width,
    ...customClasses
  } = style;
  const classList = [
    `text-${alignment}`,
  ];
  if (bold) {
    classList.push('font-weight-bold');
  }
  if (bt) {
    classList.push('bt');
  }
  if (bl) {
    classList.push('bl');
  }
  if (bb) {
    classList.push('bb');
  }
  if (br) {
    classList.push('br');
  }
  if (fontSize) {
    classList.push(`font-size-${fontSize}`);
  }
  if (muted) {
    classList.push('text-muted');
  }
  if (width) {
    classList.push(`w-${width}`);
  }
  Object.entries(customClasses).forEach(([className, active]) => {
    if (active) {
      classList.push(className);
    }
  });
  return classList;
}

function normalizeCol(columnStyle) {
  const attrs = {};
  const colStyle = TableUtils.normalizeStyle(columnStyle.style);
  const classList = getClassListForStyle(colStyle);
  if (classList.length > 0) {
    attrs.class = classList;
  }
  return { attrs };
}

function getColgroup(columnStyles) {
  let cPrev = -1;
  const colgroup = [];
  columnStyles.forEach((columnStyle) => {
    const { c } = columnStyle;
    const cDiff = c - cPrev;
    if (cDiff > 1) {
      const span = cDiff - 1;
      colgroup.push({ attrs: { span } });
    }
    const col = normalizeCol(columnStyle);
    colgroup.push(col);
    cPrev = c;
  });
  return colgroup;
}

function getSectionRows(section, header, tableStyle) {
  return section.map(row => row.map((cell) => {
    const {
      value,
      rowspan,
      colspan,
      header: cellHeader,
      style: cellStyle,
    } = TableUtils.normalizeCell(cell, header, tableStyle);
    const tag = (value && cellHeader) ? 'th' : 'td';
    const attrs = {};
    if (rowspan !== 1) {
      attrs.rowspan = rowspan;
    }
    if (colspan !== 1) {
      attrs.colspan = colspan;
    }
    const classList = getClassListForStyle(cellStyle);
    if (classList.length > 0) {
      attrs.class = classList;
    }
    return {
      tag,
      attrs,
      value,
    };
  }));
}

export default {
  name: 'FcReportTable',
  props: {
    title: {
      type: String,
      default: null,
    },
    caption: {
      type: String,
      default: null,
    },
    autoWidthTable: {
      type: Boolean,
      default: false,
    },
    dontBreakTable: {
      type: Boolean,
      default: false,
    },
    tableStyle: {
      type: Object,
      default() { return {}; },
    },
    columnStyles: {
      type: Array,
      default() { return []; },
    },
    header: {
      type: Array,
      default() { return []; },
    },
    body: Array,
    footer: {
      type: Array,
      default() { return []; },
    },
  },
  computed: {
    bodyNormalized() {
      return getSectionRows(this.body, false, this.tableStyle);
    },
    colgroup() {
      return getColgroup(this.columnStyles);
    },
    footerNormalized() {
      return getSectionRows(this.footer, false, this.tableStyle);
    },
    headerNormalized() {
      return getSectionRows(this.header, true, this.tableStyle);
    },
  },
};
</script>

<style lang="scss">
.fc-report-table {
  & > table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    &.auto-width {
      width: auto;
    }
    tr > th,
    tr > td {
      padding: var(--space-xs) var(--space-s);
      &.shade {
        background-color: var(--base-lighter);
      }
      &.peak {
        background-color: var(--error-light);
      }
    }
    & > thead {
      background-color: var(--base-lighter);
    }
  }
}
</style>
