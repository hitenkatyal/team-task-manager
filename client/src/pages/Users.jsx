const users = [
  { id: 1, name: 'Maya Patel', role: 'Developer' },
  { id: 2, name: 'Jules Kim', role: 'Product' },
  { id: 3, name: 'Alex Reed', role: 'QA' },
];

export default function Users() {
  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p>Team members and account permissions.</p>
        </div>
      </header>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
