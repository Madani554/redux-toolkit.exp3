import { createSelector, createSlice } from '@reduxjs/toolkit'

const initialAssignments = [
  { id: 'assignment-1', title: 'Limits & continuity quiz', subjectId: 'subject-cs', subjectColor: 'coral', type: 'Quiz', description: 'A short assessment on limits and continuity.', deadline: '2026-09-29', marks: 15, requirements: 'Complete in the course portal.', studentIds: ['student-1', 'student-2'], studentStatuses: { 'student-1': 'upcoming', 'student-2': 'upcoming' }, createdBy: 'faculty-1' },
  { id: 'assignment-2', title: 'Field sampling report', subjectId: 'subject-env', subjectColor: 'ochre', type: 'Lab', description: 'Document the field sampling method and results.', deadline: '2026-10-01', marks: 25, requirements: 'Submit a PDF report with field notes.', studentIds: ['student-1'], studentStatuses: { 'student-1': 'in-progress' }, createdBy: 'faculty-1' },
  { id: 'assignment-3', title: 'Relational model project', subjectId: 'subject-data', subjectColor: 'blue', type: 'Assignment', description: 'Design and normalize a relational data model.', deadline: '2026-10-03', marks: 30, requirements: 'Upload your schema and a short rationale.', studentIds: ['student-1', 'student-2'], studentStatuses: { 'student-1': 'submitted', 'student-2': 'in-progress' }, createdBy: 'faculty-1' },
  { id: 'assignment-4', title: 'Probability problem set', subjectId: 'subject-data', subjectColor: 'blue', type: 'Assignment', description: 'Practice distributions, expectation, and variance.', deadline: '2026-10-06', marks: 20, requirements: 'Show your working in one PDF.', studentIds: ['student-1'], studentStatuses: { 'student-1': 'upcoming' }, createdBy: 'faculty-1' },
  { id: 'assignment-5', title: 'Graph traversal lab', subjectId: 'subject-cs', subjectColor: 'coral', type: 'Lab', description: 'Implement breadth-first and depth-first search.', deadline: '2026-10-08', marks: 25, requirements: 'Submit source code and a test log.', studentIds: ['student-2'], studentStatuses: { 'student-2': 'in-progress' }, createdBy: 'faculty-1' },
  { id: 'assignment-6', title: 'Research question proposal', subjectId: 'subject-env', subjectColor: 'ochre', type: 'Activity', description: 'Frame a focused question for your term project.', deadline: '2026-10-12', marks: 10, requirements: 'One-page proposal, submitted as PDF.', studentIds: ['student-1', 'student-2'], studentStatuses: { 'student-1': 'upcoming', 'student-2': 'upcoming' }, createdBy: 'faculty-1' },
]

const initialState = {
  ids: initialAssignments.map((assignment) => assignment.id),
  entities: Object.fromEntries(initialAssignments.map((assignment) => [assignment.id, assignment])),
  filters: { subjectId: 'all', status: 'all', deadline: 'all', studentId: 'all', search: '' },
}

function canManage(actor) {
  return actor?.role === 'faculty' || actor?.role === 'administrator'
}

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    createAssignment: (state, action) => {
      const { assignment, actor } = action.payload
      if (!canManage(actor) || state.entities[assignment.id]) return
      state.ids.push(assignment.id)
      state.entities[assignment.id] = {
        ...assignment,
        studentStatuses: Object.fromEntries(assignment.studentIds.map((studentId) => [studentId, 'upcoming'])),
      }
    },
    updateAssignment: (state, action) => {
      const { assignment, actor } = action.payload
      if (!canManage(actor) || !state.entities[assignment.id]) return
      const existing = state.entities[assignment.id]
      state.entities[assignment.id] = {
        ...existing,
        ...assignment,
        studentStatuses: Object.fromEntries(assignment.studentIds.map((studentId) => [
          studentId,
          existing.studentStatuses[studentId] || 'upcoming',
        ])),
      }
    },
    setTaskStatus: (state, action) => {
      const { id, studentId, status, actor } = action.payload
      const assignment = state.entities[id]
      if (!assignment) return
      if (!assignment.studentIds.includes(studentId)) return
      if (canManage(actor) && status === 'graded' && assignment.studentStatuses[studentId] === 'submitted') {
        assignment.studentStatuses[studentId] = status
      } else if (actor?.role === 'student' && actor.id === studentId && ['in-progress', 'submitted'].includes(status)) {
        assignment.studentStatuses[studentId] = status
      }
    },
    setAssignmentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
})

export const { createAssignment, updateAssignment, setTaskStatus, setAssignmentFilters } = assignmentsSlice.actions

const selectAssignmentEntities = (state) => state.assignments.entities
const selectAssignmentIds = (state) => state.assignments.ids
const selectFilters = (state) => state.assignments.filters
const selectCurrentProfile = (state) => state.auth.session

export const selectAllAssignments = createSelector(
  [selectAssignmentIds, selectAssignmentEntities],
  (ids, entities) => ids.map((id) => entities[id]),
)

export const selectVisibleAssignments = createSelector(
  [selectAllAssignments, selectFilters, selectCurrentProfile],
  (assignments, filters, profile) => {
    const targetStudentId = profile.role === 'student' ? profile.id : filters.studentId
    return assignments
    .filter((assignment) => profile.role !== 'student' || assignment.studentIds.includes(profile.id))
    .filter((assignment) => targetStudentId === 'all' || assignment.studentIds.includes(targetStudentId))
    .filter((assignment) => filters.subjectId === 'all' || assignment.subjectId === filters.subjectId)
    .filter((assignment) => filters.status === 'all' || (targetStudentId === 'all'
      ? Object.values(assignment.studentStatuses).includes(filters.status)
      : assignment.studentStatuses[targetStudentId] === filters.status))
    .filter((assignment) => {
      if (filters.deadline === 'all') return true
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(`${assignment.deadline}T00:00:00`)
      const daysAway = Math.round((deadline - today) / 86400000)
      const statuses = targetStudentId === 'all'
        ? Object.values(assignment.studentStatuses)
        : [assignment.studentStatuses[targetStudentId]]
      if (filters.deadline === 'overdue') return daysAway < 0 && statuses.some((status) => !['submitted', 'graded'].includes(status))
      if (filters.deadline === 'upcoming') return daysAway >= 0
      if (filters.deadline === 'this-week') return daysAway >= 0 && daysAway <= 7
      return true
    })
    .filter((assignment) => `${assignment.title} ${assignment.description}`.toLowerCase().includes(filters.search.toLowerCase()))
    .sort((left, right) => left.deadline.localeCompare(right.deadline))
    .map((assignment) => ({
      ...assignment,
      status: targetStudentId === 'all'
        ? assignment.studentIds.length === 1 ? assignment.studentStatuses[assignment.studentIds[0]] : 'multiple'
        : assignment.studentStatuses[targetStudentId],
    }))
  },
)

export default assignmentsSlice.reducer