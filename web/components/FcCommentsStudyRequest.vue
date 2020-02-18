<template>
  <div class="fc-comments-study-request mb-4 pa-5">
    <h2 class="headline">Comments</h2>
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
        <FcButton
          :disabled="commentText.length === 0 || charsRemaining < 0"
          :loading="loadingAddComment"
          type="primary"
          @click="actionAddComment">
          Submit
        </FcButton>
      </div>
    </div>
    <section
      v-for="(comment, i) in studyRequestComments"
      :key="comment.id"
      class="mt-4">
      <header class="align-top d-flex">
        <div>
          <div class="default--text font-weight-medium subtitle-2">
            <span
              v-if="comment.userId === auth.user.id">
              {{auth.user.uniqueName}}
            </span>
            <span
              v-else-if="studyRequestCommentUsers.has(comment.userId)">
              {{studyRequestCommentUsers.get(comment.userId).uniqueName}}
            </span>
          </div>
          <div class="subtitle-1 mt-1">
            {{comment.createdAt | dateTime}}
          </div>
        </div>
        <div class="flex-fill"></div>
        <FcButton
          v-if="auth.user.id === comment.userId"
          type="icon"
          @click="actionDeleteComment(i)">
          <v-icon>mdi-delete</v-icon>
        </FcButton>
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
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcCommentsStudyRequest',
  components: {
    FcButton,
  },
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
