import { useEffect, type ReactNode } from 'react';

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/55 p-4" onClick={onClose}>
      <div className="max-h-[calc(100vh-32px)] w-full max-w-110 overflow-y-auto rounded-[10px] bg-surface text-ink shadow-[0_10px_30px_rgba(0,0,0,0.25)]" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-grid px-5 py-3.5">
          <h3 id="modal-title" className="text-[1.05rem] font-bold">{title}</h3>
          <button type="button" className="size-8 cursor-pointer rounded-md text-2xl leading-none text-ink hover:bg-surface-soft" aria-label="Закрити" onClick={onClose}>×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
