import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

const ACTION_WIDTH = 88;
const AXIS_LOCK_THRESHOLD = 8;

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  label: string;
}

/**
 * Swipe left (touch / pen) to reveal a Delete action.
 * Mouse users get the trash button on the row instead.
 */
export function SwipeableRow({ children, onDelete, label }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ x: number; y: number; start: number; axis: 'x' | 'y' | null; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    gesture.current = { x: e.clientX, y: e.clientY, start: offset, axis: null, moved: false };
  };

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis) {
      if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (g.axis === 'x') {
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // Pointer may already be released; dragging still works without capture.
        }
        setDragging(true);
      }
    }
    if (g.axis !== 'x') return;
    g.moved = true;
    setOffset(Math.max(-ACTION_WIDTH * 1.25, Math.min(0, g.start + dx)));
  };

  const endGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.axis !== 'x') return;
    setDragging(false);
    suppressClick.current = g.moved;
    setOffset((o) => (o < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0));
  };

  return (
    <div className="relative overflow-hidden">
      {offset < 0 && (
        <button
          type="button"
          onClick={() => {
            setOffset(0);
            onDelete();
          }}
          className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-red-600 text-xs font-medium text-white"
          style={{ width: Math.max(ACTION_WIDTH, -offset) }}
          aria-label={`Delete "${label}"`}
        >
          <Trash2 className="size-5" aria-hidden />
          Delete
        </button>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            e.stopPropagation();
            e.preventDefault();
          } else if (offset !== 0) {
            e.stopPropagation();
            setOffset(0);
          }
        }}
        className={`relative touch-pan-y bg-page ${dragging ? '' : 'transition-transform duration-200 ease-out'}`}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
