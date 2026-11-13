import { Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { SearchLink } from '../common/SearchInput';
import { useTaskActions } from '../../context/TaskActionsContext';
import { Logo } from './Logo';

/** Top bar. Phones get the Figma layout (search in the page, + button at the bottom); desktops get search + Add Task here. */
export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { openCreate } = useTaskActions();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex-1" />
        {showSearch && (
          <div className="hidden w-80 lg:block">
            <SearchLink />
          </div>
        )}
        <div className="hidden lg:block">
          <Button size="lg" icon={<Plus className="size-4" />} onClick={() => openCreate()}>
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
}

/** Round "+" button centred at the bottom of the screen on phones (Figma). */
export function AddTaskFab() {
  const { openCreate } = useTaskActions();
  return (
    <button
      type="button"
      onClick={() => openCreate()}
      aria-label="Add task"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-20 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-float transition-transform hover:bg-brand-700 active:scale-95 lg:hidden"
    >
      <Plus className="size-7" strokeWidth={2.25} />
    </button>
  );
}
