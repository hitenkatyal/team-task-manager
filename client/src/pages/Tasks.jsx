const tasks = [
  { id: 'T-001', title: 'Design login screen', assignee: 'Maya', status: 'In progress' },
  { id: 'T-002', title: 'Update API docs', assignee: 'Jules', status: 'Review' },
  { id: 'T-003', title: 'Fix table layout', assignee: 'Alex', status: 'Open' },
];

export default function Tasks() {
  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>All tasks across your projects and teams.</p>
        </div>
      </header>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Assignee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.assignee}</td>
                <td>{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
