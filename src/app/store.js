import { configureStore } from '@reduxjs/toolkit'
import postsReducer from '../features/posts/postsSlice'
import platformsReducer from '../features/platforms/platformsSlice'
import draftsReducer from '../features/drafts/draftsSlice'

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    drafts: draftsReducer,
  },
})

export default store
