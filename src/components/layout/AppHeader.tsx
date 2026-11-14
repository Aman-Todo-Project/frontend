import { useTaskActions } from '../../context/TaskActionsContext';
import plusIcon from '../../assets/images/Plus.png';

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
