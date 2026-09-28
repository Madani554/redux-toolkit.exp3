import { createSelector, createSlice } from '@reduxjs/toolkit'

const profiles = {
  student: { id: 'student-1', name: 'Madani Hamdi', initials: 'MH', role: 'student' },
  faculty: { id: 'faculty-1', name: 'Dr. Elena Morris', initials: 'EM', role: 'faculty' },
  administrator: { id: 'admin-1', name: 'Academic Office', initials: 'AO', role: 'administrator' },
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { session: profiles.student },
  reducers: {
    setDemoRole: (state, action) => {
      if (profiles[action.payload]) state.session = profiles[action.payload]
    },
    setAuthenticatedSession: (state, action) => {
      state.session = action.payload
    },
    clearSession: (state) => {
      state.session = profiles.student
    },
  },
})

export const { setDemoRole, setAuthenticatedSession, clearSession } = authSlice.actions
export const selectProfile = createSelector([(state) => state.auth.session], (session) => session)
export default authSlice.reducer