import { useState } from 'react';

export default function TaskForm({ onSubmit, initialData = {} }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() });
    setTitle('');
    setDescription('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter task title"
          required
        />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter task details"
        />
      </label>
      <button type="submit">Save task</button>
    </form>
  );
}
