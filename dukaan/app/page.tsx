import Image from "next/image";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Catalog from "./Catalog";

export default function Home() {
  

  return (
    <div className="h-full font-[family-name:var(--font-raleway)] w-[85vw]">
      <Navbar />
      <Hero />
      <Catalog />
    </div>
  );
}
