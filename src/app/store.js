import { configureStore } from '@reduxjs/toolkit'
import assignmentsReducer from '../features/assignments/assignmentsSlice'
import authReducer from '../features/auth/authSlice'
import subjectsReducer from '../features/subjects/subjectsSlice'
import usersReducer from '../features/users/usersSlice'

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
    auth: authReducer,
    subjects: subjectsReducer,
    users: usersReducer,
  },
})

export default store
