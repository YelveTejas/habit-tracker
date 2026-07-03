import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 dark:text-slate-300">{body}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
