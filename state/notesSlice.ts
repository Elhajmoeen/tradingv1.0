import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'

export interface Note {
  id: string
  clientId: string
  title: string
  details?: string
  priority?: 'low' | 'med' | 'high'
  createdAt: string // ISO string
  createdBy: string // user display name/id
  isActive?: boolean
}

interface NotesState {
  byId: Record<string, Note>
  allIds: string[]
}

const initialState: NotesState = {
  byId: {},
  allIds: []
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (
      state,
      action: PayloadAction<Omit<Note, 'id' | 'createdAt'> & { createdAt?: string }>
    ) => {
      const id = crypto.randomUUID()
      const createdAt = action.payload.createdAt || new Date().toISOString()
      
      const note: Note = {
        ...action.payload,
        id,
        createdAt,
        isActive: action.payload.isActive ?? true
      }
      
      state.byId[id] = note
      state.allIds.push(id)
    },
    
    editNote: (
      state,
      action: PayloadAction<{ id: string; title?: string; details?: string; priority?: 'low' | 'med' | 'high' }>
    ) => {
      const { id, ...updates } = action.payload
      if (state.byId[id]) {
        Object.assign(state.byId[id], updates)
      }
    },
    
    deleteNote: (state, action: PayloadAction<string>) => {
      const id = action.payload
      delete state.byId[id]
      state.allIds = state.allIds.filter(noteId => noteId !== id)
    },
    
    toggleActive: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (state.byId[id]) {
        state.byId[id].isActive = !state.byId[id].isActive
      }
    }
  }
})

export const { addNote, editNote, deleteNote, toggleActive } = notesSlice.actions

// Selectors
export const selectNotesByClient = createSelector(
  [(state: any) => state.notes.byId, (state: any) => state.notes.allIds, (_, clientId: string) => clientId],
  (byId, allIds, clientId) => {
    return allIds
      .map((id: string) => byId[id])
      .filter((note: Note) => note.clientId === clientId)
      .sort((a: Note, b: Note) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
)

export default notesSlice.reducer