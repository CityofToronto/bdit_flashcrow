<template>
  <div class="fc-report-table">
    <h2 v-if="title">{{title}}</h2>
    <table>
      <caption v-if="caption">
        {{caption}}
      </caption>
      <!-- TODO: colgroup -->
      <colgroup>
        <col>
        <col class="col-warrant-description">
        <col span="3">
      </colgroup>
      <thead v-if="header.length > 0">
        <tr
          v-for="(row, r) in headerNormalized"
          :key="'row_header_' + r">
          <component
            v-for="({ attrs, innerTag, tag, value }, c) in row"
            :key="'cell_header_' + r + '_' + c"
            :is="tag"
            v-bind="attrs">
            <component :is="innerTag">
              <i
                v-if="value === true || value === false"
                class="fa"
                :class="{
                  'fa-check': value,
                  'fa-times': !value,
                }"></i>
              <span v-else-if="value === null">&nbsp;</span>
              <span v-else>{{value}}</span>
            </component>
          </component>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, r) in bodyNormalized"
          :key="'row_body_' + r">
          <component
            v-for="({ attrs, innerTag, tag, value }, c) in row"
            :key="'cell_body_' + r + '_' + c"
            :is="tag"
            v-bind="attrs">
            <component :is="innerTag">
              <i
                v-if="value === true || value === false"
                class="fa"
                :class="{
                  'fa-check': value,
                  'fa-times': !value,
                }"></i>
              <span v-else-if="value === null">&nbsp;</span>
              <span v-else>{{value}}</span>
            </component>
          </component>
        </tr>
      </tbody>
      <tfoot v-if="footer.length > 0">
        <tr
          v-for="(row, r) in footerNormalized"
          :key="'row_footer_' + r">
          <component
            v-for="({ attrs, innerTag, tag, value }, c) in row"
            :key="'cell_footer_' + r + '_' + c"
            :is="tag"
            v-bind="attrs">
            <component :is="innerTag">
              <i
                v-if="value === true || value === false"
                class="fa"
                :class="{
                  'fa-check': value,
                  'fa-times': !value,
                }"></i>
              <span v-else-if="value === null">&nbsp;</span>
              <span v-else>{{value}}</span>
            </component>
          </component>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
function normalizeCellStyle(style) {
  const defaultStyle = {
    bold: false,
    bt: false,
    bl: false,
    bb: false,
    br: false,
    fontSize: null,
  };
  return Object.assign(defaultStyle, style);
}

function getClassListForCellStyle(cellStyle) {
  const {
    bt,
    bl,
    bb,
    br,
    fontSize,
  } = cellStyle;
  const classList = [];
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
  return classList;
}

function normalizeCell(cell, header) {
  // top-level options
  const defaultOptions = {
    value: null,
    rowspan: 1,
    colspan: 1,
    header,
  };
  const {
    value,
    rowspan,
    colspan,
    header: cellHeader,
  } = Object.assign(defaultOptions, cell);
  const tag = cellHeader ? 'th' : 'td';
  const attrs = {};
  if (rowspan !== 1) {
    attrs.rowspan = rowspan;
  }
  if (colspan !== 1) {
    attrs.colspan = colspan;
  }
  const cellStyle = normalizeCellStyle(cell.style);
  const classList = getClassListForCellStyle(cellStyle);
  if (classList.length > 0) {
    attrs.class = classList;
  }

  const { bold } = cellStyle;
  const innerTag = bold ? 'strong' : 'span';
  return {
    attrs,
    innerTag,
    tag,
    value,
  };
}

export default {
  name: 'FcReportTable',
  props: {
    body: Array,
    caption: {
      type: String,
      default() { return null; },
    },
    columnStyles: {
      type: Array,
      default() { return []; },
    },
    footer: {
      type: Array,
      default() { return []; },
    },
    header: {
      type: Array,
      default() { return []; },
    },
    title: {
      type: String,
      default() { return null; },
    },
  },
  computed: {
    bodyNormalized() {
      return this.body.map(row => row.map(
        cell => normalizeCell(cell, false),
      ));
    },
    footerNormalized() {
      return this.footer.map(row => row.map(
        cell => normalizeCell(cell, false),
      ));
    },
    headerNormalized() {
      return this.header.map(row => row.map(
        cell => normalizeCell(cell, true),
      ));
    },
  },
};
</script>

<style lang="postcss">
.fc-report-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  tr > th,
  tr > td {
    padding: var(--space-xs) var(--space-s);
  }
  tr > td {
    text-align: right;
  }
  & > thead {
    background-color: var(--base-lighter);
  }
  & > tbody {
    & > tr:nth-child(2n) {
      background-color: var(--base-lighter);
    }
  }
}
</style>
