import { Link } from 'react-router-dom';

const projects = [
  { id: 'alpha', name: 'Alpha Sprint', description: 'Improve onboarding flow and task automation.' },
  { id: 'beta', name: 'Beta Launch', description: 'Prepare launch campaign and QA backlog.' },
];

export default function Projects() {
  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Browse active projects and open task lists.</p>
        </div>
      </header>
      <div className="project-grid">
        {projects.map((project) => (
          <article key={project.id} className="task-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <Link className="secondary-button" to={`/projects/${project.id}`}>
              View board
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
