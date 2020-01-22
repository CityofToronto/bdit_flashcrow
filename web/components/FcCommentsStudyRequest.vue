<template>
  <div class="fc-comments-study-request mb-4">
    <h2>Comments</h2>
    <div class="fc-comment-new">
      <textarea
        v-model="commentText"
        class="font-size-m full-width my-2 px-4 py-2"
        :disabled="loadingCommentNew"
        placeholder="Compose message"
        rows="5"></textarea>
      <div class="fc-comment-new-submit flex-container-row">
        <div
          v-if="loadingCommentNew"
          class="fc-comment-new-spinner ma-1">
          <TdsLoadingSpinner />
        </div>
        <button
          v-else
          class="font-size-m tds-button-primary uppercase"
          :disabled="commentText.length === 0 || charsRemaining < 0 || loadingCommentNew"
          @click="onSubmitCommentNew">
          Submit
        </button>
        <div
          class="fc-comment-chars-remaining ml-2"
          :class="{
            invalid: charsRemaining < 0,
          }">
          {{charsRemaining}}
        </div>
      </div>
    </div>
    <div
      v-if="studyRequestComments.length === 0"
      class="mt-4">
      <span class="font-size-l text-muted">No comments.</span>
    </div>
    <section
      v-for="comment in studyRequestComments"
      :key="comment.id"
      class="fc-comment font-size-s mt-4">
      <hr />
      <header class="flex-container-row font-size-s mx-4">
        <div>
          <div class="mt-2">
            <strong
              v-if="comment.userId === auth.user.id">
              {{auth.user.uniqueName}}
            </strong>
            <strong
              v-else-if="studyRequestCommentUsers.has(comment.userId)">
              {{studyRequestCommentUsers.get(comment.userId).uniqueName}}
            </strong>
            <span v-else class="text-muted">
              Author unknown
            </span>
          </div>
          <div class="mt-1">
            {{comment.createdAt | dateTime}}
          </div>
        </div>
        <div class="flex-fill"></div>
        <v-btn
          v-if="auth.user.id === comment.userId"
          @click="actionDelete(comment)">
          <v-icon left>mdi-delete</v-icon> Delete
        </v-btn>
      </header>
      <div class="font-size-m mt-4 mx-4">
        {{ comment.comment }}
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import TdsLoadingSpinner from '@/web/components/tds/TdsLoadingSpinner.vue';

export default {
  name: 'FcCommentsStudyRequest',
  components: {
    TdsLoadingSpinner,
  },
  props: {
    sizeLimit: Number,
    studyRequest: Object,
  },
  data() {
    return {
      commentText: '',
      loadingCommentNew: false,
    };
  },
  computed: {
    charsRemaining() {
      return this.sizeLimit - this.commentText.length;
    },
    ...mapState('requestStudy', [
      'studyRequestComments',
      'studyRequestCommentUsers',
    ]),
    ...mapState([
      'auth',
    ]),
  },
  methods: {
    actionDelete(comment) {
      const { studyRequest } = this;
      this.deleteStudyRequestComment({ studyRequest, comment });
    },
    async onSubmitCommentNew() {
      const { studyRequest } = this;
      const comment = {
        comment: this.commentText,
      };
      this.commentText = '';
      this.loadingCommentNew = true;
      await this.saveStudyRequestComment({ studyRequest, comment });
      this.loadingCommentNew = false;
    },
    ...mapActions('requestStudy', [
      'saveStudyRequestComment',
      'deleteStudyRequestComment',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-comments-study-request {
  & > .fc-comment-new {
    & > textarea {
      resize: none;
    }
    & > .fc-comment-new-submit {
      align-items: center;
      & > .fc-comment-new-spinner {
        height: var(--font-size-l);
        width: var(--font-size-l);
      }
      & > .fc-comment-chars-remaining.invalid {
        color: var(--error-dark);
      }
    }
    & > .fc-comment > header {
      align-items: center;
    }
  }
}
</style>
