import { useParams } from 'react-router-dom';

export default function ProjectDetail() {
  const { projectId } = useParams();

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Project details</h1>
          <p>Kanban view for project <strong>{projectId}</strong>.</p>
        </div>
      </header>
      <div className="project-detail">
        <section className="task-card">
          <h2>Backlog</h2>
          <p>Gather requirements and assign tasks.</p>
        </section>
        <section className="task-card">
          <h2>In progress</h2>
          <p>Work currently being executed by the team.</p>
        </section>
        <section className="task-card">
          <h2>Review</h2>
          <p>Tasks ready for review and testing.</p>
        </section>
      </div>
    </div>
  );
}
