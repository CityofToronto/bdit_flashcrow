<template>
  <div class="fc-comments-study-request mb-4 pa-5">
    <h2>Comments</h2>
    <div class="fc-comment-new">
      <v-textarea
        v-model="commentText"
        class="mt-4"
        :counter="sizeLimit"
        :loading="loadingAddComment"
        no-resize
        outlined
        placeholder="Compose message"
        rows="4"></v-textarea>
      <div class="text-right">
        <v-btn
          color="primary"
          :disabled="commentText.length === 0 || charsRemaining < 0"
          :loading="loadingAddComment"
          @click="actionAddComment">
          Submit
        </v-btn>
      </div>
    </div>
    <section
      v-for="(comment, i) in studyRequestComments"
      :key="comment.id"
      class="mt-4">
      <header class="align-top d-flex">
        <div>
          <div>
            <strong
              v-if="comment.userId === auth.user.id">
              {{auth.user.uniqueName}}
            </strong>
            <strong
              v-else-if="studyRequestCommentUsers.has(comment.userId)">
              {{studyRequestCommentUsers.get(comment.userId).uniqueName}}
            </strong>
          </div>
          <div>
            {{comment.createdAt | dateTime}}
          </div>
        </div>
        <div class="flex-fill"></div>
        <v-btn
          v-if="auth.user.id === comment.userId"
          icon
          @click="actionDeleteComment(i)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </header>
      <div class="mt-2 mb-4">
        {{ comment.comment }}
      </div>
      <v-divider></v-divider>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  deleteStudyRequestComment,
  postStudyRequestComment,
} from '@/lib/api/WebApi';

export default {
  name: 'FcCommentsStudyRequest',
  props: {
    sizeLimit: Number,
    studyRequest: Object,
    studyRequestComments: Array,
    studyRequestCommentUsers: Map,
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
      const persistedComment = await postStudyRequestComment(csrf, studyRequest, comment);
      this.$emit('add-comment', persistedComment);
      this.loadingAddComment = false;
    },
    async actionDeleteComment(i) {
      const { auth: { csrf }, studyRequest, studyRequestComments } = this;
      const comment = studyRequestComments[i];
      this.$emit('delete-comment', i);
      await deleteStudyRequestComment(csrf, studyRequest, comment);
    },
  },
};
</script>
