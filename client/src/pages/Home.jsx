import { useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import TaskForm from '../components/TaskForm.jsx';

const initialTasks = [
  { id: 1, title: 'Welcome task', description: 'This is your first task.' },
];

export default function Home() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const taskList = useMemo(
    () =>
      tasks.map((task) => (
        <article key={task.id} className="task-card">
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </article>
      )),
    [tasks]
  );

  const handleAddTask = (task) => {
    setTasks((current) => [
      ...current,
      { id: Date.now(), title: task.title, description: task.description },
    ]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Manage your tasks and stay on track.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsModalOpen(true)}>
          New task
        </button>
      </header>

      <section className="task-grid">{taskList}</section>

      <Modal title="Add a new task" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TaskForm onSubmit={handleAddTask} />
      </Modal>
    </div>
  );
}
