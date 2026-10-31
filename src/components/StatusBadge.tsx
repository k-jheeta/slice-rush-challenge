import type { OrderStatus } from '../types';
import './StatusBadge.css';

const LABEL: Record<OrderStatus, string> = {
  PENDING: 'Sending',
  QUEUED: 'Queued',
  IN_OVEN: 'In oven',
  ON_THE_WAY: 'On the way',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

export function StatusBadge({ status, title }: { status: OrderStatus; title?: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase().replace(/_/g, '-')}`} title={title}>
      {LABEL[status]}
    </span>
  );
}
