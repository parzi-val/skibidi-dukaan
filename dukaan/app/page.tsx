import Image from "next/image";
import Navbar from "./Navbar";
export default function Home() {
  return (
    <div className="h-full font-[family-name:var(--font-geist-sans)] w-[85vw]">
      <Navbar />
      <div className="min-h-[70vh] w-full flex justify-center flex-row items-center">
        <h1 className="text-[#090909] text-6xl font-medium text-center  ">A place to make money.<br></br> Or get snacks.</h1>
        <Image 
        src="/hero.png"
        alt="hero"
        width={1500}
        height={1500}
        className="w-1/3 h-1/3"
        />
      </div>
      
    </div>
  );
}
