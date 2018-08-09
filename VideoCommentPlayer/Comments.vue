<template>
  <div class="comment-list-div">
    <h3 class="center center-block">Comments</h3>
    <div class="comment-list">
      <div v-for="c in visibleComments" :key="c.id" >
        <comment
          :comment="c"
          :currentUserId="currentUserId"
          :jumpToTime="jumpToTime"
          @commentDelete="handleCommentDelete"
          @commentEdit="handleCommentEdit"
          :editingCommentIdAdd="editingCommentIdAdd"
          :editingCommentIdRemove="editingCommentIdRemove"
          :time="elapsedSeconds"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Comment from './Comment.vue'

export default {
  name: 'comment-list',
  components: { Comment },
  props: {
    commentDelete: Function,
    commentEdit: Function,
    comments: {
      type: Array,
      default () {
        return []
      }
    },
    commentNextPageBuffer: {
      type: Number,
      default: 5
    },
    currentUserId: {
      type: String,
      default: '',
    },
    elapsedSeconds: {
      type: Number,
      default: 0
    },
    jumpToTime: Function,
    totalCommentCount: {
      type: Number,
      default: 0
    },
    onShowNewComment: Function
  },
  data () {
    return {
      editingCommentIds: [],
      lastCommentCount: 0
    }
  },
  computed: {
    commentCounter () {
      return this.totalCommentCount
    },
    localCommentsLength () {
      return this.comments.length
    },
    visibleComments () {
      const arr = this.comments
      return arr
        .filter(cmt => this.elapsedSeconds >= cmt.time
          || this.editingCommentIds.indexOf(cmt.id) > -1)
        .sort((c1, c2) => c2.time - c1.time)
    },
    visibleCommentCount () {
      return this.visibleComments.length
    }
  },
  methods: {
    handleCommentDelete (data) {
      this.$emit('commentDelete', data)
    },
    handleCommentEdit (data) {
      this.$emit('commentEdit', data)
    },
    editingCommentIdAdd (i) {
      this.editingCommentIds.push(i)
    },
    editingCommentIdRemove (i) {
      this.editingCommentIds = this.editingCommentIds.filter(cmtId => cmtId !== i)
    }
  },
  watch: {
    visibleCommentCount: {
      immediate: true, 
      handler (newCount, oldCount) {
        if (newCount > oldCount) this.onShowNewComment()
        if (newCount === this.localCommentsLength - this.commentNextPageBuffer) {
          this.$emit('commentFetchNext')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.comment-list-div {
  margin: 5px 0;
}
.comment-list {
  text-align: left;
  overflow-y: auto;
  overflow-wrap: break-word;
  min-height: 500px;
}
</style>