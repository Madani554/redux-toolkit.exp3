import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPost, fetchPosts, removePost, togglePublish } from './features/posts/postsSlice'
import { addPlatform, removePlatform } from './features/platforms/platformsSlice'
import { deleteDraft, saveDraft } from './features/drafts/draftsSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const posts = useSelector((state) => state.posts)
  const platforms = useSelector((state) => state.platforms)
  const drafts = useSelector((state) => state.drafts)

  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [formPlatformId, setFormPlatformId] = useState('platform-1')

  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  const normalizedPosts = useMemo(
    () => posts.ids.map((id) => posts.entities[id]),
    [posts.entities, posts.ids],
  )

  const platformOptions = useMemo(
    () => platforms.ids.map((id) => platforms.entities[id]),
    [platforms.entities, platforms.ids],
  )

  const handleSaveDraft = () => {
    if (!draftTitle.trim() || !draftContent.trim()) return

    dispatch(saveDraft({
      id: `draft-${Date.now()}`,
      title: draftTitle.trim(),
      content: draftContent.trim(),
      platformId: formPlatformId,
    }))
    setDraftTitle('')
    setDraftContent('')
  }

  const handleCreatePost = () => {
    if (!draftTitle.trim() || !draftContent.trim()) return

    dispatch(addPost({
      id: `post-${Date.now()}`,
      title: draftTitle.trim(),
      content: draftContent.trim(),
      platformId: formPlatformId,
      published: false,
    }))
    setDraftTitle('')
    setDraftContent('')
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Experiment 1.2.1</p>
          <h1>Centralized content planning with Redux Toolkit</h1>
          <p className="hero-copy">
            This dashboard demonstrates how posts, platforms, and drafts are managed from a single global store.
            The state is normalized, structured, and updated through predictable actions.
          </p>
        </div>
        <div className="stats-grid">
          <article>
            <strong>{normalizedPosts.length}</strong>
            <span>Posts</span>
          </article>
          <article>
            <strong>{platformOptions.length}</strong>
            <span>Platforms</span>
          </article>
          <article>
            <strong>{drafts.items.length}</strong>
            <span>Drafts</span>
          </article>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Create a post</h2>
            <p>Draft your idea and push it into the shared store.</p>
          </div>
          <label>
            Title
            <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Seasonal campaign idea" />
          </label>
          <label>
            Content
            <textarea value={draftContent} onChange={(event) => setDraftContent(event.target.value)} placeholder="Describe the message, audience, and call to action." />
          </label>
          <label>
            Platform
            <select value={formPlatformId} onChange={(event) => setFormPlatformId(event.target.value)}>
              {platformOptions.map((platform) => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
          </label>
          <div className="actions">
            <button type="button" className="secondary" onClick={handleSaveDraft}>Save Draft</button>
            <button type="button" onClick={handleCreatePost}>Publish to Store</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Platforms</h2>
            <p>Each platform is stored as a normalized entity.</p>
          </div>
          <ul className="list-card">
            {platformOptions.map((platform) => (
              <li key={platform.id}>
                <span>
                  <strong>{platform.name}</strong>
                  <small>{platform.category}</small>
                </span>
                <button type="button" className="ghost" onClick={() => dispatch(removePlatform(platform.id))}>Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" className="secondary full" onClick={() => dispatch(addPlatform({ id: `platform-${Date.now()}`, name: 'New Channel', category: 'Emerging' }))}>Add Sample Platform</button>
        </div>
      </section>

      <section className="panel-grid lower">
        <div className="panel">
          <div className="panel-header">
            <h2>Live posts</h2>
            <p>The posts list is derived from the centralized posts state.</p>
          </div>
          <ul className="list-card">
            {normalizedPosts.map((post) => (
              <li key={post.id}>
                <span>
                  <strong>{post.title}</strong>
                  <small>{post.content}</small>
                </span>
                <div className="mini-actions">
                  <button type="button" className="ghost" onClick={() => dispatch(togglePublish(post.id))}>{post.published ? 'Unpublish' : 'Publish'}</button>
                  <button type="button" className="ghost" onClick={() => dispatch(removePost(post.id))}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Drafts</h2>
            <p>Drafts stay separate until they are promoted into posts.</p>
          </div>
          <ul className="list-card">
            {drafts.items.map((draft) => (
              <li key={draft.id}>
                <span>
                  <strong>{draft.title}</strong>
                  <small>{draft.content}</small>
                </span>
                <button type="button" className="ghost" onClick={() => dispatch(deleteDraft(draft.id))}>Clear</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default App
