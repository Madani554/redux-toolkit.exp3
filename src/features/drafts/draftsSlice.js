import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    saveDraft: (state, action) => {
      const draft = action.payload
      const existing = state.items.findIndex((item) => item.id === draft.id)
      if (existing >= 0) {
        state.items[existing] = draft
      } else {
        state.items.push(draft)
      }
    },
    deleteDraft: (state, action) => {
      state.items = state.items.filter((draft) => draft.id !== action.payload)
    },
  },
})

export const { saveDraft, deleteDraft } = draftsSlice.actions
export const draftsReducer = draftsSlice.reducer
export default draftsReducer
