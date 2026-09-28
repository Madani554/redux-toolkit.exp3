import { createSelector, createSlice } from '@reduxjs/toolkit'

const initialState = {
  ids: ['student-1', 'student-2', 'faculty-1', 'admin-1'],
  entities: {
    'student-1': { id: 'student-1', name: 'Madani Hamdi', initials: 'MH', role: 'student' },
    'student-2': { id: 'student-2', name: 'Mateo Diaz', initials: 'MD', role: 'student' },
    'faculty-1': { id: 'faculty-1', name: 'Dr. Elena Morris', initials: 'EM', role: 'faculty' },
    'admin-1': { id: 'admin-1', name: 'Academic Office', initials: 'AO', role: 'administrator' },
  },
}

const usersSlice = createSlice({ name: 'users', initialState, reducers: {} })
export const selectAllUsers = createSelector(
  [(state) => state.users.ids, (state) => state.users.entities],
  (ids, entities) => ids.map((id) => entities[id]),
)
export default usersSlice.reducer