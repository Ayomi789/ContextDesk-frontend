import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'card' | 'elevated';
}

/**
 * Themed dropdown. Renders its panel in a portal with fixed positioning
 * so it never clips inside modals or scroll containers.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  variant = 'card',
}: SelectProps) {
  const surface =
    variant === 'elevated' ? 'bg-bg-elevated' : 'bg-bg-card';
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  const measure = useCallback(() => {
    const el = btnRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const panelH = Math.min(224, options.length * 36 + 8);
    const flip = window.innerHeight - r.bottom < panelH + 8;
    setPos({
      left: r.left,
      width: r.width,
      top: flip ? r.top - panelH - 4 : r.bottom + 4,
    });
    return true;
  }, [options.length]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value)
    );
    setActive(idx);
    if (measure()) setOpen(true);
  }, [disabled, measure, options, value]);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('[data-select-panel]')
      ) {
        closeMenu();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    const onScroll = () => closeMenu();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, closeMenu]);

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) closeMenu();
      else openMenu();
    } else if (e.key === 'Escape') {
      closeMenu();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[active];
      if (opt) {
        onChange(opt.value);
        closeMenu();
        btnRef.current?.focus();
      }
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onButtonKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-auto inline-flex items-center justify-between gap-2 px-3 py-2 ${surface} border border-border rounded-lg text-sm text-left focus:outline-none focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span
          className={`truncate ${selected ? 'text-text' : 'text-text-dim'}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-text-dim transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open &&
        createPortal(
          <div
            data-select-panel
            role="listbox"
            tabIndex={-1}
            onKeyDown={onListKey}
            className="fixed z-[100] rounded-lg border border-border bg-bg-card shadow-xl shadow-black/10 overflow-hidden"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            <div className="max-h-56 overflow-y-auto py-1">
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-text-dim">
                  No options
                </div>
              )}
              {options.map((opt, i) => {
                const isSel = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    onClick={() => {
                      onChange(opt.value);
                      closeMenu();
                      btnRef.current?.focus();
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                      i === active
                        ? 'bg-bg-hover text-text'
                        : 'text-text-muted'
                    }`}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSel && (
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
