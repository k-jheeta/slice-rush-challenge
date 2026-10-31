import { useId, type ReactNode } from 'react';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmClassName?: string;
}

/**
 * Part 1: static markup only.
 * Part 3: add onConfirm/onCancel, render into document.body with a portal, move focus in on open and
 * back on close, close on Escape / backdrop click, and trap Tab inside the dialog.
 */
export function ConfirmDialog({ title, children, confirmLabel, confirmClassName = 'btn-primary' }: ConfirmDialogProps) {
  const titleId = useId();
  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 className="dialog-title" id={titleId}>
          {title}
        </h2>
        <div className="dialog-body">{children}</div>
        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" className={`btn ${confirmClassName}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
