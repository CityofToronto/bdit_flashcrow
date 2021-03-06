<template>
  <section
    aria-labelledby="heading_request_comments"
    class="fc-comments-study-request">
    <v-row no-gutters>
      <v-col class="px-5" cols="6">
        <h3 class="display-2" id="heading_request_comments">
          <span>Comments</span>
          <FcTextNumberTotal class="ml-2" :n="studyRequestComments.length" />
        </h3>
        <div class="fc-comment-new">
          <FcTextarea
            v-model="commentText"
            class="mt-4"
            label="Compose new comment"
            :loading="loadingAddComment" />
          <div class="text-right mb-4">
            <FcButton
              :disabled="commentText.length === 0"
              :loading="loadingAddComment"
              type="primary"
              @click="actionAddComment">
              Submit
            </FcButton>
          </div>
        </div>
      </v-col>
      <v-col class="px-5" cols="6">
        <dl>
          <div
            v-for="(comment, i) in studyRequestComments"
            :key="comment.id"
            class="fc-comment">
            <dt class="align-center d-flex mt-2">
              <span class="body-1 default--text font-weight-medium">
                <span class="sr-only">Author: </span>
                <span v-if="studyRequestUsers.has(comment.userId)">
                  {{studyRequestUsers.get(comment.userId) | username}}
                </span>
                <span v-else-if="comment.userId === auth.user.id">
                  {{auth.user | username}}
                </span>
                <span v-else class="sr-only">Unknown</span>
              </span>

              <v-spacer></v-spacer>

              <FcButtonAria
                v-if="auth.user.id === comment.userId"
                aria-label="Delete comment"
                left
                type="icon"
                @click="actionDeleteComment(i)">
                <v-icon>mdi-delete</v-icon>
              </FcButtonAria>
            </dt>
            <dt class="subtitle-2 mt-n2">
              <span class="sr-only">Date: </span>
              {{comment.createdAt | dateTime}}
            </dt>
            <dd class="body-2 mt-3 mb-2">
              {{ comment.comment }}
            </dd>
          </div>
        </dl>
      </v-col>
    </v-row>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import {
  deleteStudyRequestComment,
  postStudyRequestComment,
} from '@/lib/api/WebApi';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcTextarea from '@/web/components/inputs/FcTextarea.vue';

export default {
  name: 'FcCommentsStudyRequest',
  components: {
    FcButton,
    FcButtonAria,
    FcTextarea,
    FcTextNumberTotal,
  },
  props: {
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

<style lang="scss">
.fc-comments-study-request {
  & dl > .fc-comment:not(:first-child) {
    border-top: 1px solid var(--v-border-base);
  }
}
</style>
