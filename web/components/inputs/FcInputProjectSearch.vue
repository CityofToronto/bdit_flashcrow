<template>
  <div class="fc-input-project-search">
    <v-autocomplete
      v-model="select"
      cache-items
      clearable
      hide-no-data
      hide-details="auto"
      :items="studyRequestsBulk"
      item-text="name"
      item-value="id"
      label="Search for an existing project..."
      :loading="loading"
      outlined
      :search-input.sync="search"
      v-bind="$attrs">
      <template v-slot:item="{ item }">
        <v-list-item-content>
          <v-list-item-title>{{item.name}}</v-list-item-title>
          <v-list-item-subtitle>ID: {{item.id}}</v-list-item-subtitle>
        </v-list-item-content>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { getStudyRequestsBulkSuggest } from '@/lib/api/WebApi';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcInputProjectSearch',
  mixins: [FcMixinVModelProxy(Object)],
  data() {
    return {
      loading: false,
      search: null,
      select: null,
      studyRequestsBulk: [],
    };
  },
  computed: {
    studyRequestBulkSelected() {
      if (this.select === null) {
        return null;
      }
      const i = this.studyRequestsBulk.findIndex(({ id }) => this.select === id);
      if (i === -1) {
        return null;
      }
      return this.studyRequestsBulk[i];
    },
  },
  watch: {
    search() {
      if (!!this.search && this.search !== this.select) {
        this.queryBackend(this.search);
      }
    },
    studyRequestBulkSelected() {
      this.internalValue = this.studyRequestBulkSelected;
    },
  },
  methods: {
    async queryBackend(search) {
      this.loading = true;
      const studyRequestsBulk = await getStudyRequestsBulkSuggest(search);
      this.studyRequestsBulk = studyRequestsBulk;
      this.loading = false;
    },
  },
};
</script>
