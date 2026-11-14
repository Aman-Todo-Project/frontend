import { useNavigate } from "react-router-dom";
import circleImg from "../assets/images/circle.png";
import flowImg from "../assets/images/flow.png";
import { Button } from "../components/common/Button";

/**
 * Welcome screen from the Figma phone frame (390×844).
 * Desktop (>= 576px): split 50/50, blue panel on the left, text + button on the right.
 */
export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-97.5 flex-col bg-white desktop:max-w-none desktop:flex-row">
      {/* Blue panel: top of the phone screen, left half on desktop */}
      <div className="relative min-h-60 flex-1 overflow-hidden bg-blue desktop:w-1/2 desktop:flex-none">
        <img
          src={circleImg}
          alt=""
          aria-hidden
          className="absolute right-0 top-0 h-10.5 w-17.5 lg:h-21 lg:w-35"
        />
        <img
          src={flowImg}
          alt=""
          aria-hidden
          className="absolute -left-1.25 top-13.25 w-37.5 rotate-180 lg:w-75"
        />
        <img
          src={flowImg}
          alt=""
          aria-hidden
          className="absolute -bottom-4.75 right-0 w-37.5 lg:w-75"
        />
      </div>

      {/* White section: bottom of the phone screen, right half on desktop */}
      <div className="flex h-73 shrink-0 flex-col p-6 pb-8 desktop:h-auto desktop:w-1/2 desktop:items-center desktop:justify-center desktop:px-8 desktop:py-16">
        <div className="flex h-full w-full flex-col desktop:h-auto desktop:max-w-sm">
          <h1 className="text-24 font-semibold leading-9 text-black lg:text-[36px] lg:leading-tight">
            Manage What To Do
          </h1>
          <p className="mt-4 text-12 leading-4.25 text-text-label desktop:text-14 desktop:leading-6">
            The best way to manage what you have to do, don't forget your plans
          </p>
          <Button
            size="lg"
            fullWidth
            className="mt-auto rounded-none! text-base! font-normal! desktop:mt-10"
            onClick={() => navigate("/tasks")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
