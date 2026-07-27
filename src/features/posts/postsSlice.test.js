import { describe, expect, it } from 'vitest'
import { postsReducer, addPost, removePost } from './postsSlice'
import { draftsReducer, saveDraft, deleteDraft } from '../drafts/draftsSlice'

describe('posts and drafts slices', () => {
  it('adds a post and removes it from normalized state', () => {
    const initialState = {
      ids: [],
      entities: {},
      status: 'idle',
      error: null,
    }

    const nextState = postsReducer(initialState, addPost({
      id: 'post-1',
      title: 'Launch plan',
      content: 'Ready for review',
      platformId: 'platform-1',
      published: false,
    }))

    expect(nextState.ids).toEqual(['post-1'])
    expect(nextState.entities['post-1'].title).toBe('Launch plan')

    const removedState = postsReducer(nextState, removePost('post-1'))
    expect(removedState.ids).toEqual([])
    expect(removedState.entities['post-1']).toBeUndefined()
  })

  it('persists and deletes drafts', () => {
    const initialState = { items: [] }

    const nextState = draftsReducer(initialState, saveDraft({
      id: 'draft-1',
      title: 'Draft note',
      content: 'Work in progress',
    }))

    expect(nextState.items).toHaveLength(1)

    const removedState = draftsReducer(nextState, deleteDraft('draft-1'))
    expect(removedState.items).toEqual([])
  })
})
