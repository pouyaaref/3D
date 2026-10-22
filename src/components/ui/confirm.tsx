'use client';
import { useEffect, useRef } from 'react';
export default function Confirm({
  open,
  title,
  description,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="confirm-title"
    >
      <h2 id="confirm-title">{title}</h2>
      <p>{description}</p>
      <div className="actions">
        <button autoFocus className="button secondary" disabled={busy} onClick={onClose}>
          انصراف
        </button>
        <button className="button danger" disabled={busy} onClick={onConfirm}>
          {busy ? 'در حال حذف…' : 'حذف دائمی'}
        </button>
      </div>
    </dialog>
  );
}
