import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/state/store'
import { updateEntityField } from '@/state/entitiesSlice'

export interface Comment {
  id: string
  entityId: string
  authorId: string
  authorName: string
  text: string
  createdAt: string
  statusApplied?: string
}

interface CommentsState {
  byEntityId: Record<string, Comment[]>
  loading: boolean
  error: string | null
}

const initialState: CommentsState = {
  byEntityId: {},
  loading: false,
  error: null
}

// Thunk to post comment and update entity
export const postCommentAndUpdateEntity = createAsyncThunk(
  'comments/postCommentAndUpdateEntity',
  async (
    { entityId, text, statusApplied }: { entityId: string; text: string; statusApplied?: string },
    { dispatch, getState }
  ) => {
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityId,
      authorId: 'current_user', // TODO: get from auth state
      authorName: 'Current User', // TODO: get from auth state  
      text,
      createdAt: new Date().toISOString(),
      statusApplied
    }

    // Add comment first
    dispatch(commentsSlice.actions.addComment({ entityId, comment }))

    // Update entity's lastCommentAt
    dispatch(updateEntityField({
      id: entityId,
      key: 'lastCommentAt',
      value: comment.createdAt
    }))

    // Update lead status if provided
    if (statusApplied) {
      dispatch(updateEntityField({
        id: entityId,
        key: 'leadStatus',
        value: statusApplied
      }))
    }

    return comment
  }
)

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<{ entityId: string; comment: Comment }>) => {
      const { entityId, comment } = action.payload
      if (!state.byEntityId[entityId]) {
        state.byEntityId[entityId] = []
      }
      state.byEntityId[entityId].unshift(comment) // Add to beginning for reverse-chronological order
    },
    clearEntityComments: (state, action: PayloadAction<string>) => {
      const entityId = action.payload
      delete state.byEntityId[entityId]
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postCommentAndUpdateEntity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postCommentAndUpdateEntity.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(postCommentAndUpdateEntity.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to post comment'
      })
  }
})

// Selectors
export const selectCommentsByEntityId = createSelector(
  [(state: RootState) => state.comments.byEntityId, (_: RootState, entityId: string) => entityId],
  (byEntityId, entityId) => byEntityId[entityId] || []
)

export const selectCommentsLoading = (state: RootState) => state.comments.loading
export const selectCommentsError = (state: RootState) => state.comments.error

export const { addComment, clearEntityComments, setError } = commentsSlice.actions
export default commentsSlice.reducer