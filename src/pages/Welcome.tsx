import { useNavigate } from "react-router-dom";
import circleImg from "../assets/images/circle.png";
import flowImg from "../assets/images/flow.png";
import { Button } from "../components/common/Button";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-97.5 flex-col bg-white">
      {/* Blue top panel: takes all height above the 292px bottom section (552px on an 844px screen) */}
      <div className="relative min-h-60 flex-1 overflow-hidden bg-blue">
        <img
          src={circleImg}
          alt=""
          aria-hidden
          className="absolute right-0 top-0 h-10.5 w-17.5"
        />
        <img
          src={flowImg}
          alt=""
          aria-hidden
          className="absolute -left-1.25 top-13.25 w-37.5 rotate-180"
        />
        <img
          src={flowImg}
          alt=""
          aria-hidden
          className="absolute -bottom-4.75 right-0 w-37.5"
        />
      </div>

      {/* White bottom section */}

      <div className="flex h-73 shrink-0 flex-col p-6 pb-8">
        <h1 className="text-24 font-semibold leading-9 text-black">
          Manage What To Do
        </h1>
        <p className="mt-4 text-text-label text-12 leading-4.25 ">
          The best way to manage what you have to do, don't forget your plans
        </p>
        <Button
          size="lg"
          fullWidth
          className="mt-auto rounded-none! text-base! font-normal!"
          onClick={() => navigate("/tasks")}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
