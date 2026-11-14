import { Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { SearchLink } from '../common/SearchInput';
import { useTaskActions } from '../../context/TaskActionsContext';
import { Logo } from './Logo';
import plusIcon from '../../assets/images/Plus.png';

/** Desktop top bar (used by the search page on large screens). */
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

/** Figma "+" button: 76px blue circle, centred, 28px above the bottom of the screen. */
export function AddTaskFab() {
  const { openCreate } = useTaskActions();
  return (
    <button
      type="button"
      onClick={() => openCreate()}
      aria-label="Add task"
      className="fixed bottom-[max(28px,env(safe-area-inset-bottom))] left-1/2 z-20 flex size-19 -translate-x-1/2 items-center justify-center rounded-full bg-blue transition-transform hover:bg-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-95 active:bg-dark-blue"
    >
      <img src={plusIcon} alt="" aria-hidden className="size-8.25" />
    </button>
  );
}
