import { AlertIcon, CheckCircleIcon, CloseIcon, InfoIcon } from './icons';
import './Toasts.css';

export type ToastVariant = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
  /** ms before auto-dismiss; 0 = sticky */
  duration: number;
}

const ICON = { success: CheckCircleIcon, error: AlertIcon, info: InfoIcon };

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss?: (id: number) => void }) {
  return (
    // Polite live region: screen readers announce new toasts without interrupting
    <div className="toasts" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => {
        const Icon = ICON[t.variant];
        return (
          <div key={t.id} className={`toast toast-${t.variant}`} role={t.variant === 'error' ? 'alert' : 'status'}>
            <Icon className="toast-icon" />
            <div className="toast-content">
              <p className="toast-title">{t.title}</p>
              {t.message && <p className="toast-message">{t.message}</p>}
            </div>
            <button
              type="button"
              className="icon-btn toast-close"
              aria-label="Dismiss notification"
              onClick={() => onDismiss?.(t.id)}
            >
              <CloseIcon size={12} />
            </button>
            {t.duration > 0 && <span className="toast-timer" style={{ animationDuration: `${t.duration}ms` }} />}
          </div>
        );
      })}
    </div>
  );
}
