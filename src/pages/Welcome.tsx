import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { hasOnboarded, markOnboarded } from '../utils/storage';

function Zigzag({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="5" className={className} aria-hidden>
      {[8, 28, 48].map((y) => (
        <polyline key={y} points={`0,${y + 6} 15,${y - 6} 30,${y + 6} 45,${y - 6} 60,${y + 6} 75,${y - 6} 90,${y + 6} 105,${y - 6} 120,${y + 6}`} />
      ))}
    </svg>
  );
}

/** Onboarding screen from the Figma. Shown once. */
export default function Welcome() {
  const navigate = useNavigate();

  if (hasOnboarded()) return <Navigate to="/" replace />;

  const start = () => {
    markOnboarded();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:flex-row">
      <div className="relative min-h-[58dvh] overflow-hidden bg-brand-600 lg:min-h-dvh lg:flex-1">
        <span className="absolute -right-12 -top-12 size-36 rounded-full border-[22px] border-white/15" aria-hidden />
        <Zigzag className="absolute -left-2 top-[22%] w-28 text-white/20" />
        <Zigzag className="absolute -right-2 bottom-[10%] w-32 text-white/20" />
      </div>

      <div className="flex flex-1 flex-col justify-between px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 lg:justify-center lg:px-20">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-ink-900 lg:text-4xl">Manage What To Do</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-500">
            The best way to manage what you have to do, don't forget your plans
          </p>
        </div>
        <Button size="lg" fullWidth className="mt-10 lg:max-w-sm" onClick={start}>
          Get Started
        </Button>
      </div>
    </div>
  );
}
