import { createSelector, createSlice } from '@reduxjs/toolkit'

const initialState = {
  ids: ['subject-cs', 'subject-data', 'subject-env'],
  entities: {
    'subject-cs': { id: 'subject-cs', name: 'Computer Science', shortName: 'Computer science', code: 'CS 204', color: 'coral' },
    'subject-data': { id: 'subject-data', name: 'Data Science', shortName: 'Data science', code: 'DS 110', color: 'blue' },
    'subject-env': { id: 'subject-env', name: 'Environmental Studies', shortName: 'Environmental studies', code: 'ES 222', color: 'ochre' },
  },
}

const subjectsSlice = createSlice({ name: 'subjects', initialState, reducers: {} })
export const selectAllSubjects = createSelector(
  [(state) => state.subjects.ids, (state) => state.subjects.entities],
  (ids, entities) => ids.map((id) => entities[id]),
)
export default subjectsSlice.reducer