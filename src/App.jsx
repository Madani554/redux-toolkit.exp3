import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createAssignment,
  selectVisibleAssignments,
  setAssignmentFilters,
  setTaskStatus,
  updateAssignment,
} from './features/assignments/assignmentsSlice'
import { selectProfile, setDemoRole } from './features/auth/authSlice'
import { selectAllSubjects } from './features/subjects/subjectsSlice'
import { selectAllUsers } from './features/users/usersSlice'
import './App.css'

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
const shortDateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
const fullDateFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' })
const today = new Date()
today.setHours(0, 0, 0, 0)
const blankForm = { title: '', subjectId: 'subject-cs', type: 'Assignment', description: '', deadline: '', marks: '20', requirements: '', studentIds: ['student-1', 'student-2'] }

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function App() {
  const dispatch = useDispatch()
  const profile = useSelector(selectProfile)
  const subjects = useSelector(selectAllSubjects)
  const users = useSelector(selectAllUsers)
  const assignments = useSelector(selectVisibleAssignments)
  const filters = useSelector((state) => state.assignments.filters)
  const totalAssignments = useSelector((state) => state.assignments.ids.length)
  const [activeView, setActiveView] = useState('Overview')
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [form, setForm] = useState(blankForm)
  const isFaculty = profile.role === 'faculty' || profile.role === 'administrator'
  const isStudent = profile.role === 'student'
  const firstName = profile.name.split(' ')[0]
  const dueSoon = useSelector((state) => state.assignments.ids.filter((id) => {
    const assignment = state.assignments.entities[id]
    const days = Math.round((new Date(`${assignment.deadline}T00:00:00`) - today) / 86400000)
    const statuses = isStudent ? [assignment.studentStatuses[profile.id]] : Object.values(assignment.studentStatuses)
    return days >= 0 && days <= 7 && (!isStudent || assignment.studentIds.includes(profile.id)) && statuses.some((status) => !['submitted', 'graded'].includes(status))
  }).length)
  const completed = assignments.filter((assignment) => isStudent
    ? ['submitted', 'graded'].includes(assignment.status)
    : Object.values(assignment.studentStatuses).every((status) => ['submitted', 'graded'].includes(status))).length
  const calendarCells = useMemo(() => {
    const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const previousDays = new Date(month.getFullYear(), month.getMonth(), 0).getDate()
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - offset + 1
      return { date: new Date(month.getFullYear(), month.getMonth(), day), day: day < 1 ? previousDays + day : day > days ? day - days : day, inMonth: day > 0 && day <= days }
    })
  }, [month])

  const openCreateForm = () => {
    setEditingAssignment(null)
    setForm({ ...blankForm, deadline: dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)) })
    setIsFormOpen(true)
  }
  const openEditForm = (assignment) => {
    setEditingAssignment(assignment)
    setForm({ ...assignment, marks: String(assignment.marks), studentIds: [...assignment.studentIds] })
    setIsFormOpen(true)
  }
  const closeForm = () => { setIsFormOpen(false); setEditingAssignment(null) }
  const submitForm = (event) => {
    event.preventDefault()
    const assignment = { ...form, id: editingAssignment?.id || `assignment-${Date.now()}`, marks: Number(form.marks), status: editingAssignment?.status || 'upcoming', createdBy: profile.id }
    dispatch(editingAssignment ? updateAssignment({ assignment, actor: profile }) : createAssignment({ assignment, actor: profile }))
    closeForm()
  }
  const updateFilter = (key, value) => dispatch(setAssignmentFilters({ [key]: value }))
  const assignmentsForDate = (date) => assignments.filter((assignment) => assignment.deadline === dateKey(date))
  const formatDeadline = (value) => shortDateFormatter.format(new Date(`${value}T00:00:00`))

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveView('Overview')}><span className="brand-mark"><span /></span><span><strong>campus</strong><small>STUDENT DESK</small></span></a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">{['Overview', 'Assignments', 'Calendar'].map((item, index) => <button key={item} className={activeView === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveView(item)}><span className={`nav-glyph glyph-${index}`} aria-hidden="true">{['◫', '▤', '▦'][index]}</span>{item}{item === 'Assignments' && <span className="nav-count">{assignments.length}</span>}</button>)}</nav>
        <div className="sidebar-divider" />
        <div className="sidebar-label">YOUR SUBJECTS</div>
        <div className="subject-nav">{subjects.slice(0, 4).map((subject) => <button key={subject.id} onClick={() => { updateFilter('subjectId', subject.id); setActiveView('Assignments') }}><span className={`subject-dot ${subject.color}`} />{subject.shortName}<span>{subject.code}</span></button>)}</div>
        {isFaculty && <button className="sidebar-create" onClick={openCreateForm}><span>+</span> Create an activity</button>}
        <div className="sidebar-bottom"><div className="semester-tag"><span className="status-pulse" />Fall semester <span>2026</span></div><div className="profile-card"><div className={`avatar ${profile.role}`}>{profile.initials}</div><div className="profile-copy"><strong>{profile.name}</strong><small>{profile.role === 'administrator' ? 'Administrator' : profile.role === 'faculty' ? 'Faculty member' : 'Student'}</small></div><span className="profile-menu" aria-hidden="true">···</span></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeView}</strong></div><div className="topbar-actions"><label className="role-switch"><span>DEMO VIEW</span><select aria-label="Switch demo role" value={profile.role} onChange={(event) => dispatch(setDemoRole(event.target.value))}><option value="student">Student</option><option value="faculty">Faculty</option><option value="administrator">Administrator</option></select></label><button className="user-avatar" aria-label="Current profile">{profile.initials}</button></div></header>
        <div className="page-content">
          <section className="welcome-row"><div><p className="date-line">{fullDateFormatter.format(today)}</p><h1>{activeView === 'Overview' ? <>Good {today.getHours() < 12 ? 'morning' : 'afternoon'}, {firstName}<span className="heading-period">.</span></> : activeView}</h1><p className="welcome-subtitle">{isFaculty ? 'Your classes, activities, and student progress at a glance.' : 'A clear view of what is due and what comes next.'}</p></div>{isFaculty && <button className="primary-button" onClick={openCreateForm}><span>+</span> New activity</button>}</section>

          {activeView !== 'Calendar' && <section className="metric-row" aria-label="Assignment summary"><article className="metric-card"><span className="metric-icon icon-green">▤</span><div><small>{isStudent ? 'Assigned to you' : 'Total activities'}</small><strong>{isStudent ? assignments.length : totalAssignments}<em> activities</em></strong></div><span className="metric-note">This semester</span></article><article className="metric-card"><span className="metric-icon icon-orange">◷</span><div><small>Due in 7 days</small><strong>{dueSoon}<em> deadlines</em></strong></div><span className="metric-note warm">Keep an eye out</span></article><article className="metric-card"><span className="metric-icon icon-blue">✓</span><div><small>{isStudent ? 'Submitted' : 'Completed'}</small><strong>{isStudent ? completed : assignments.filter((assignment) => ['submitted', 'graded'].includes(assignment.status)).length}<em> of {assignments.length}</em></strong></div><span className="metric-note">Across your classes</span></article></section>}

          <section className={activeView === 'Calendar' ? 'content-grid calendar-focus' : 'content-grid'}>
            {(activeView === 'Overview' || activeView === 'Calendar') && <section className="surface calendar-panel" aria-label="Assignment deadline calendar"><div className="section-heading calendar-heading"><div><span className="section-kicker">DEADLINE MAP</span><h2>{monthFormatter.format(month)}</h2></div><div className="calendar-tools"><button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button><button className="today-button" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button></div></div><div className="calendar-grid calendar-weekdays">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid calendar-days">{calendarCells.map(({ date, day, inMonth }) => { const dayAssignments = assignmentsForDate(date); const isToday = dateKey(date) === dateKey(today); return <div key={dateKey(date)} className={`calendar-day ${inMonth ? '' : 'muted-day'} ${isToday ? 'is-today' : ''}`}><span className="day-number">{day}</span><div className="day-events">{dayAssignments.slice(0, 2).map((assignment) => <span key={assignment.id} className={`calendar-event ${assignment.subjectColor}`} title={assignment.title}>{assignment.title}</span>)}{dayAssignments.length > 2 && <small>+{dayAssignments.length - 2} more</small>}</div>{dayAssignments.length > 0 && <span className="mobile-event-dot" />}</div>})}</div><div className="calendar-legend"><span><i className="legend-dot dot-coral" />Computer science</span><span><i className="legend-dot dot-blue" />Data science</span><span><i className="legend-dot dot-ochre" />Environmental studies</span></div></section>}

            {(activeView === 'Overview' || activeView === 'Assignments') && <section className="surface assignments-panel"><div className="section-heading assignments-heading"><div><span className="section-kicker">YOUR COURSEWORK</span><h2>{activeView === 'Overview' ? 'Upcoming activities' : 'All assignments'}</h2></div><button className="text-link" onClick={() => setActiveView('Assignments')}>View all <span>→</span></button></div><div className="filter-row"><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search activities" placeholder="Search activities" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} /></label><select aria-label="Filter by subject" value={filters.subjectId} onChange={(event) => updateFilter('subjectId', event.target.value)}><option value="all">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select><select aria-label="Filter by status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="all">Any status</option><option value="upcoming">Not started</option><option value="in-progress">In progress</option><option value="submitted">Submitted</option><option value="graded">Graded</option></select><select aria-label="Filter by deadline" value={filters.deadline} onChange={(event) => updateFilter('deadline', event.target.value)}><option value="all">Any deadline</option><option value="upcoming">Upcoming</option><option value="this-week">Due this week</option><option value="overdue">Overdue</option></select>{isFaculty && <select aria-label="Filter by student" value={filters.studentId} onChange={(event) => updateFilter('studentId', event.target.value)}><option value="all">All students</option>{users.filter((user) => user.role === 'student').map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select>}</div><div className="assignment-list">{assignments.slice(0, activeView === 'Overview' ? 5 : undefined).map((assignment) => { const subject = subjects.find((item) => item.id === assignment.subjectId); const due = new Date(`${assignment.deadline}T00:00:00`); const isOverdue = due < today && !['submitted', 'graded'].includes(assignment.status); const gradeStudentId = filters.studentId === 'all' ? assignment.studentIds[0] : filters.studentId; return <article className="assignment-item" key={assignment.id}><div className={`assignment-type-mark ${assignment.subjectColor}`}>{assignment.type === 'Quiz' ? 'Q' : assignment.type === 'Lab' ? 'L' : assignment.type === 'Activity' ? 'A' : 'D'}</div><div className="assignment-detail"><div className="assignment-title-row"><h3>{assignment.title}</h3><span className={`status-chip status-${assignment.status}`}>{isOverdue ? 'Overdue' : assignment.status.replace('-', ' ')}</span></div><p>{subject?.name} <span>·</span> {assignment.type} <span>·</span> {assignment.marks} marks</p><div className="assignment-mobile-date">Due {formatDeadline(assignment.deadline)}</div></div><div className={`deadline-cell ${isOverdue ? 'overdue' : ''}`}><small>{isOverdue ? 'Past due' : 'Due date'}</small><strong>{formatDeadline(assignment.deadline)}</strong></div>{isFaculty ? <div className="item-actions"><button aria-label={`Edit ${assignment.title}`} title="Edit activity" onClick={() => openEditForm(assignment)}>Edit</button>{assignment.status === 'submitted' && <button className="grade-action" onClick={() => dispatch(setTaskStatus({ id: assignment.id, studentId: gradeStudentId, status: 'graded', actor: profile }))}>Grade</button>}</div> : <div className="item-actions">{!['submitted', 'graded'].includes(assignment.status) && <button className="submit-action" onClick={() => dispatch(setTaskStatus({ id: assignment.id, studentId: profile.id, status: 'submitted', actor: profile }))}>Submit</button>}{assignment.status === 'submitted' && <span className="submitted-label">Submitted ✓</span>}</div>}</article>})}{assignments.length === 0 && <div className="empty-state"><span>∅</span><strong>No activities match these filters</strong><p>Try changing the subject or status above.</p></div>}</div>{isFaculty && <div className="assignment-footer"><span>Managing activities as {profile.role === 'administrator' ? 'administrator' : 'faculty'}</span><button onClick={openCreateForm}>+ Add activity</button></div>}</section>}
          </section>
          <footer className="page-footer"><span>Campus Planner <b>·</b> Fall 2026</span><span>Academic work, in good order.</span></footer>
        </div>
      </main>

      {isFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm() }}><section className="activity-modal" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title"><div className="modal-heading"><div><span className="section-kicker">FACULTY WORKSPACE</span><h2 id="activity-modal-title">{editingAssignment ? 'Edit activity' : 'Create an activity'}</h2></div><button className="close-modal" aria-label="Close" onClick={closeForm}>×</button></div><form onSubmit={submitForm}><label className="form-wide">Activity title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Midterm review worksheet" /></label><div className="form-row"><label>Subject<select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })}>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label>Activity type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{['Assignment', 'Lab', 'Quiz', 'Activity'].map((type) => <option key={type}>{type}</option>)}</select></label></div><label className="form-wide">Description<textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What should students learn or complete?" /></label><div className="form-row"><label>Deadline<input type="date" required value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label><label>Marks<input type="number" min="0" required value={form.marks} onChange={(event) => setForm({ ...form, marks: event.target.value })} /></label></div><label className="form-wide">Submission requirements<input required value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} placeholder="PDF upload, code repository, in-person..." /></label><fieldset className="student-picker"><legend>Assign to students</legend>{users.filter((user) => user.role === 'student').map((student) => <label key={student.id}><input type="checkbox" checked={form.studentIds.includes(student.id)} onChange={(event) => setForm({ ...form, studentIds: event.target.checked ? [...form.studentIds, student.id] : form.studentIds.filter((id) => id !== student.id)} )} />{student.name}</label>)}</fieldset><div className="modal-actions"><button type="button" className="cancel-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingAssignment ? 'Save changes' : 'Publish activity'}</button></div></form></section></div>}
    </div>
  )
}

export default App