import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  ids: ['platform-1', 'platform-2'],
  entities: {
    'platform-1': { id: 'platform-1', name: 'Instagram', category: 'Social' },
    'platform-2': { id: 'platform-2', name: 'LinkedIn', category: 'Professional' },
  },
}

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    addPlatform: (state, action) => {
      const platform = action.payload
      state.ids.push(platform.id)
      state.entities[platform.id] = platform
    },
    removePlatform: (state, action) => {
      const id = action.payload
      state.ids = state.ids.filter((platformId) => platformId !== id)
      delete state.entities[id]
    },
  },
})

export const { addPlatform, removePlatform } = platformsSlice.actions
export default platformsSlice.reducer
