import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  ids: [],
  entities: {},
  status: 'idle',
  error: null,
}

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  return [
    {
      id: 'post-1',
      title: 'Launch planning',
      content: 'Outline the rollout and campaign flow.',
      platformId: 'platform-1',
      published: true,
    },
    {
      id: 'post-2',
      title: 'Audience insights',
      content: 'Share the latest engagement highlights.',
      platformId: 'platform-2',
      published: false,
    },
  ]
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action) => {
      const post = action.payload
      state.ids.push(post.id)
      state.entities[post.id] = post
    },
    removePost: (state, action) => {
      const id = action.payload
      state.ids = state.ids.filter((postId) => postId !== id)
      delete state.entities[id]
    },
    togglePublish: (state, action) => {
      const post = state.entities[action.payload]
      if (post) {
        post.published = !post.published
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.ids = action.payload.map((post) => post.id)
        state.entities = Object.fromEntries(action.payload.map((post) => [post.id, post]))
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Unable to load posts'
      })
  },
})

export const { addPost, removePost, togglePublish } = postsSlice.actions
export const postsReducer = postsSlice.reducer
export default postsReducer
