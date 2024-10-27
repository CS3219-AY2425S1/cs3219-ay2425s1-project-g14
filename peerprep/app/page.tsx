import FadeUpAnimation from "@/components/animations/FadeUp";
import Link from "next/link";
import BoringSlideShow from "@/components/home/BoringSlideShow";

export default function Home() {
  return (
    <>
      <FadeUpAnimation>
        <h1 className="text-center text-4xl font-semibold">
          Welcome to PeerPrep!
        </h1>
      </FadeUpAnimation>

      <div className={""}>
        <div className={"mt-3 flex justify-center"}>
          <div
            className={
              "m-3 flex w-1/2 flex-col justify-center rounded-md text-lg"
            }
          >
            <BoringSlideShow />
            <p className={"text-center"}>Boring code platforms 😢</p>
          </div>
          <div className={"m-3 flex w-1/2 justify-center rounded-md text-lg"}>
            <div className={"rounded-md border-2 border-black p-5"}>
              <p>Tired of solving interview questions by yourself?</p>
              <p> Code with a friend 👥 instead! 😊</p>
              <p>PeerPrep is a platform for technical interview preparation</p>

              <div className={"m-5 rounded-md border-2 border-black p-5"}>
                <p>Features:</p>
                <ol>
                  <li>Online coding</li>
                  <li> A code editor</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            className={
              "m-3 rounded-md bg-blue-700 p-3 text-xl font-bold text-white hover:bg-blue-600"
            }
          >
            <Link href="/questions"> Try it now! </Link>
          </button>
        </div>
      </div>
    </>
  );
}
