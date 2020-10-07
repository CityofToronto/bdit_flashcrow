<template>
  <v-row
    class="fc-comments-study-request"
    no-gutters>
    <v-col class="px-5" cols="6">
      <h2 class="headline">Comments</h2>
      <div class="fc-comment-new">
        <v-textarea
          v-model="commentText"
          class="mt-4"
          :counter="sizeLimit"
          label="Compose message"
          :loading="loadingAddComment"
          no-resize
          outlined
          rows="4"></v-textarea>
        <div class="text-right">
          <FcButton
            :disabled="commentText.length === 0 || charsRemaining < 0"
            :loading="loadingAddComment"
            type="primary"
            @click="actionAddComment">
            Submit
          </FcButton>
        </div>
      </div>
    </v-col>
    <v-col class="px-5" cols="6">
      <section
        v-for="(comment, i) in studyRequestComments"
        :key="comment.id"
        class="mt-4">
        <header class="align-top d-flex">
          <div>
            <div class="default--text font-weight-medium subtitle-2">
              <span
                v-if="studyRequestUsers.has(comment.userId)">
                {{studyRequestUsers.get(comment.userId) | username}}
              </span>
            </div>
            <div class="subtitle-1 mt-1">
              {{comment.createdAt | dateTime}}
            </div>
          </div>
          <v-spacer></v-spacer>
          <FcButtonAria
            v-if="auth.user.id === comment.userId"
            aria-label="Delete comment"
            left
            type="icon"
            @click="actionDeleteComment(i)">
            <v-icon>mdi-delete</v-icon>
          </FcButtonAria>
        </header>
        <div class="mt-2 mb-4">
          {{ comment.comment }}
        </div>
        <v-divider></v-divider>
      </section>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex';
import {
  deleteStudyRequestComment,
  postStudyRequestComment,
} from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';

export default {
  name: 'FcCommentsStudyRequest',
  components: {
    FcButton,
    FcButtonAria,
  },
  props: {
    sizeLimit: Number,
    studyRequest: Object,
    studyRequestComments: Array,
    studyRequestUsers: Map,
  },
  data() {
    return {
      commentText: '',
      loadingAddComment: false,
    };
  },
  computed: {
    charsRemaining() {
      return this.sizeLimit - this.commentText.length;
    },
    ...mapState(['auth']),
  },
  methods: {
    async actionAddComment() {
      const { auth: { csrf }, studyRequest } = this;
      const comment = {
        comment: this.commentText,
      };
      this.commentText = '';
      this.loadingAddComment = true;
      const response = await postStudyRequestComment(csrf, studyRequest, comment);
      this.$emit('add-comment', response);
      this.loadingAddComment = false;
    },
    async actionDeleteComment(i) {
      const { auth: { csrf }, studyRequest, studyRequestComments } = this;
      const comment = studyRequestComments[i];
      const response = await deleteStudyRequestComment(csrf, studyRequest, comment);
      this.$emit('delete-comment', { i, ...response });
    },
  },
};
</script>
