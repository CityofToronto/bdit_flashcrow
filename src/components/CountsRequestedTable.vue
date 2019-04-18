<template>
  <table class="counts-requested-table">
    <caption>Your selected data</caption>
    <thead>
      <tr>
        <th>Count</th>
        <th>Date</th>
        <th>Status</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(count, i) in dataSelectionItems"
        :key="i">
        <td>{{count.type.label}}</td>
        <td>
          <span v-if="count.date">{{count.date | date}}</span>
          <span v-else class="text-muted">
            N/A
          </span>
        </td>
        <td>{{STATUS_META[count.status]}}</td>
        <td class="text-right">
          <button
            class="btn-remove-count"
            @click="onClickRemoveCount(count)">
            <i class="fa fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

const STATUS_META = [
  'Recent',
  '3+ years old',
  'Not in system',
  'Requested',
];

export default {
  name: 'CountsRequestedTable',
  data() {
    return {
      STATUS_META,
    };
  },
  computed: {
    ...mapGetters(['dataSelectionItems']),
  },
  methods: {
    onClickRemoveCount(count) {
      this.removeFromDataSelection(count);
    },
    ...mapActions(['removeFromDataSelection']),
  },
};
</script>

<style lang="postcss">
.counts-requested-table {
  border-collapse: separate;
  border-spacing: 0 calc(var(--sp) * 2);
  width: 100%;
  & > caption {
    caption-side: top;
    padding-bottom: calc(var(--sp) * 2);
  }
  & > thead {
    font-size: var(--text-xl);
    & > tr > th {
      text-align: left;
    }
  }
  & > tbody {
    font-size: var(--text-md);
    & > tr {
      background-color: var(--white);
      cursor: pointer;
      & > td {
        padding: calc(var(--sp) * 2) 0;
        border-top: 1px solid var(--outline-grey);
        border-bottom: 1px solid var(--outline-grey);
        &:first-child {
          border-left: 4px solid var(--outline-grey);
        }
        &:last-child {
          border-right: 1px solid var(--outline-grey);
        }
        & > .btn-remove-count {
          margin-right: calc(var(--sp) * 2);
        }
      }
    }
  }
}
</style>
