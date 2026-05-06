export default function Dashboard() {
  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your current projects, tasks, and team activity.</p>
        </div>
      </header>
      <div className="grid-cards">
        <section className="stat-card">
          <h2>8</h2>
          <p>Active projects</p>
        </section>
        <section className="stat-card">
          <h2>24</h2>
          <p>Open tasks</p>
        </section>
        <section className="stat-card">
          <h2>6</h2>
          <p>Team members</p>
        </section>
      </div>
    </div>
  );
}
