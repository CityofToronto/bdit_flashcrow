<template>
  <div class="fc-comments-study-request mb-l">
    <h2>Comments</h2>
    <div class="fc-comment-new">
      <textarea
        v-model="commentText"
        class="font-size-m full-width my-m px-l py-m"
        :disabled="loadingCommentNew"
        placeholder="Compose message"
        rows="5"></textarea>
      <div class="fc-comment-new-submit flex-container-row">
        <div
          v-if="loadingCommentNew"
          class="fc-comment-new-spinner mx-s my-xs">
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
          class="fc-comment-chars-remaining ml-m"
          :class="{
            invalid: charsRemaining < 0,
          }">
          {{charsRemaining}}
        </div>
      </div>
    </div>
    <div
      v-if="studyRequestComments.length === 0"
      class="mt-l">
      <span class="font-size-l text-muted">No comments.</span>
    </div>
    <section
      v-for="comment in studyRequestComments"
      :key="comment.id"
      class="fc-comment font-size-s mt-l">
      <hr />
      <header class="flex-container-row font-size-s mx-l">
        <div>
          <div class="mt-m">
            <strong
              v-if="comment.userSubject === auth.user.subject">
              {{auth.user.name}}
            </strong>
            <strong
              v-else-if="studyRequestCommentUsers.has(comment.userSubject)">
              {{studyRequestCommentUsers.get(comment.userSubject).name}}
            </strong>
            <span v-else class="text-muted">
              Author unknown
            </span>
          </div>
          <div class="mt-s">
            {{comment.createdAt | dateTime}}
          </div>
        </div>
        <div class="flex-fill"></div>
        <button
          v-if="auth.user.subject === comment.userSubject"
          class="font-size-m uppercase"
          @click="actionDelete(comment)">
          <i class="fa fa-trash" />
          <span> Delete</span>
        </button>
      </header>
      <div class="font-size-m mt-l mx-l">
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
