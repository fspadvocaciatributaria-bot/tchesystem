import { type ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-ink-card border border-ink-border rounded-xl2 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-ink-border sticky top-0 bg-ink-card">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button className="text-muted hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
