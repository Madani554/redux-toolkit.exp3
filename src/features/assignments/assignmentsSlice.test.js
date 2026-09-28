import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import assignmentsReducer, {
  createAssignment,
  selectVisibleAssignments,
  setAssignmentFilters,
  setTaskStatus,
  updateAssignment,
} from './assignmentsSlice'
import authReducer, { setDemoRole } from '../auth/authSlice'
import subjectsReducer from '../subjects/subjectsSlice'
import usersReducer from '../users/usersSlice'

function createTestStore() {
  return configureStore({
    reducer: {
      assignments: assignmentsReducer,
      auth: authReducer,
      subjects: subjectsReducer,
      users: usersReducer,
    },
  })
}

describe('academic assignment state', () => {
  it('limits student assignment visibility to tasks assigned to that student', () => {
    const store = createTestStore()
    const visible = selectVisibleAssignments(store.getState())

    expect(visible.map((assignment) => assignment.id)).toEqual([
      'assignment-1', 'assignment-2', 'assignment-3', 'assignment-4', 'assignment-6',
    ])
    expect(selectVisibleAssignments(store.getState())).toBe(visible)

    store.dispatch(setDemoRole('faculty'))
    expect(selectVisibleAssignments(store.getState())).toHaveLength(6)

    store.dispatch(setAssignmentFilters({ studentId: 'student-2' }))
    const mateoAssignments = selectVisibleAssignments(store.getState())
    expect(mateoAssignments.map((assignment) => assignment.id)).toEqual([
      'assignment-1', 'assignment-3', 'assignment-5', 'assignment-6',
    ])
    expect(mateoAssignments.find((assignment) => assignment.id === 'assignment-3').status).toBe('in-progress')
  })

  it('combines subject and submission-status filters', () => {
    const store = createTestStore()
    store.dispatch(setAssignmentFilters({ subjectId: 'subject-data', status: 'submitted' }))

    expect(selectVisibleAssignments(store.getState()).map((assignment) => assignment.id)).toEqual(['assignment-3'])

    store.dispatch(setAssignmentFilters({ search: 'probability' }))
    expect(selectVisibleAssignments(store.getState())).toEqual([])
  })

  it('filters deadlines into the selected time window', () => {
    const store = createTestStore()
    store.dispatch(setDemoRole('faculty'))
    const actor = store.getState().auth.session
    const deadlineFromToday = (days) => {
      const date = new Date()
      date.setDate(date.getDate() + days)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    const assignment = (id, days) => ({
      id,
      title: id,
      subjectId: 'subject-cs',
      description: '',
      deadline: deadlineFromToday(days),
      studentIds: ['student-1'],
    })

    store.dispatch(createAssignment({ assignment: assignment('due-soon', 2), actor }))
    store.dispatch(createAssignment({ assignment: assignment('due-later', 20), actor }))
    store.dispatch(setAssignmentFilters({ deadline: 'this-week', subjectId: 'subject-cs' }))
    const filteredIds = selectVisibleAssignments(store.getState()).map((item) => item.id)

    expect(filteredIds).toContain('due-soon')
    expect(filteredIds).not.toContain('due-later')
  })

  it('allows students to submit only their own work and faculty to grade submissions', () => {
    const store = createTestStore()
    const student = store.getState().auth.session

    store.dispatch(setTaskStatus({ id: 'assignment-2', studentId: student.id, status: 'submitted', actor: student }))
    expect(store.getState().assignments.entities['assignment-2'].studentStatuses[student.id]).toBe('submitted')

    store.dispatch(setTaskStatus({ id: 'assignment-5', studentId: student.id, status: 'submitted', actor: student }))
    expect(store.getState().assignments.entities['assignment-5'].studentStatuses['student-2']).toBe('in-progress')

    store.dispatch(setDemoRole('faculty'))
    store.dispatch(setTaskStatus({ id: 'assignment-2', studentId: student.id, status: 'graded', actor: store.getState().auth.session }))
    expect(store.getState().assignments.entities['assignment-2'].studentStatuses[student.id]).toBe('graded')
    expect(store.getState().assignments.entities['assignment-3'].studentStatuses['student-2']).toBe('in-progress')
  })

  it('rejects assignment creation and modification from a student session', () => {
    const store = createTestStore()
    const student = store.getState().auth.session
    const assignment = {
      id: 'new-assignment',
      title: 'Unauthorized activity',
      studentIds: ['student-1'],
    }

    store.dispatch(createAssignment({ assignment, actor: student }))
    store.dispatch(updateAssignment({ assignment: { ...assignment, title: 'Changed title' }, actor: student }))

    expect(store.getState().assignments.entities['new-assignment']).toBeUndefined()
  })
})