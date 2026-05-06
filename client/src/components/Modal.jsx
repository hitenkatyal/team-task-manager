export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className="modal-close">
            ×
          </button>
        </header>
        <section>{children}</section>
      </div>
    </div>
  );
}
