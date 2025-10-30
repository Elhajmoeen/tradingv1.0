import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { updateEntityField } from './entitiesSlice'

export interface Comment {
  id: string
  clientId: string // keeping for backward compatibility - represents entityId
  text: string
  createdAt: string // ISO string
  createdBy: string // user display name/id
  editedAt?: string // ISO string
  isPinned?: boolean
  statusApplied?: string // optional lead status that was applied with this comment
}

interface CommentsState {
  byId: Record<string, Comment>
  allIds: string[]
}

const initialState: CommentsState = {
  byId: {},
  allIds: []
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addComment: (
      state,
      action: PayloadAction<Omit<Comment, 'id' | 'createdAt'> & { createdAt?: string }>
    ) => {
      const id = crypto.randomUUID()
      const createdAt = action.payload.createdAt || new Date().toISOString()
      
      const comment: Comment = {
        ...action.payload,
        id,
        createdAt
      }
      
      state.byId[id] = comment
      state.allIds.push(id)
    },
    
    editComment: (
      state,
      action: PayloadAction<{ id: string; text: string }>
    ) => {
      const { id, text } = action.payload
      if (state.byId[id]) {
        state.byId[id].text = text
        state.byId[id].editedAt = new Date().toISOString()
      }
    },
    
    deleteComment: (state, action: PayloadAction<string>) => {
      const id = action.payload
      delete state.byId[id]
      state.allIds = state.allIds.filter(commentId => commentId !== id)
    },
    
    togglePin: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (state.byId[id]) {
        state.byId[id].isPinned = !state.byId[id].isPinned
      }
    }
  }
})

// Async thunk for posting comment and updating entity
export const postCommentAndUpdateEntity = createAsyncThunk(
  'comments/postCommentAndUpdateEntity',
  async ({ 
    entityId, 
    text, 
    authorId, 
    authorName, 
    statusApplied 
  }: { 
    entityId: string
    text: string
    authorId: string
    authorName: string
    statusApplied?: string 
  }, { dispatch }) => {
    const now = new Date().toISOString()
    
    // Create comment
    const comment = {
      clientId: entityId,
      text,
      createdBy: authorName,
      statusApplied,
      createdAt: now
    }
    
    // Add comment to state
    dispatch(addComment(comment))
    
    // Update entity's lastCommentAt
    dispatch(updateEntityField({
      id: entityId,
      key: 'lastCommentAt',
      value: now
    }))
    
    // Update entity's leadStatus if provided
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

export const { addComment, editComment, deleteComment, togglePin } = commentsSlice.actions

// Selectors
export const selectCommentsByClient = createSelector(
  [(state: any) => state.comments.byId, (state: any) => state.comments.allIds, (_, clientId: string) => clientId],
  (byId, allIds, clientId) => {
    return allIds
      .map((id: string) => byId[id])
      .filter((comment: Comment) => comment.clientId === clientId)
      .sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
)

export const selectLastCommentAt = createSelector(
  [(state: any) => state.comments.byId, (state: any) => state.comments.allIds, (_, clientId: string) => clientId],
  (byId, allIds, clientId) => {
    const clientComments = allIds
      .map((id: string) => byId[id])
      .filter((comment: Comment) => comment.clientId === clientId)
    
    if (clientComments.length === 0) return undefined
    
    return clientComments
      .sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      .createdAt
  }
)

export default commentsSlice.reducer