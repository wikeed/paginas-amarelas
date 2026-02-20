'use client';

interface FeedbackAlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  className?: string;
}

const styles = {
  success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
  error: 'bg-red-500/20 border-red-500/50 text-red-200',
  info: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200',
};

export function FeedbackAlert({ type, message, className = '' }: FeedbackAlertProps) {
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`mb-4 p-3 rounded border text-sm ${styles[type]} ${className}`}
    >
      {message}
    </div>
  );
}
