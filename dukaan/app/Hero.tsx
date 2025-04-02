"use client"
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddListingModal from "./AddListingModal";
const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className=" min-h-[45vh] md:min-h-[70vh] w-full flex justify-center flex-col md:flex-row items-center">
    <div className="flex flex-col justify-center items-center gap-8">
      <h1 className="text-[#090909] text-4xl md:text-6xl font-medium text-center  ">A place to make money.<br></br> Or get snacks.</h1>
      <div className="flex flex-row gap-6">
        <Link href="/#catalog">
          <Button size={"lg"} className="text-xl">Browse</Button>
        </Link>
        
         <AddListingModal 
            trigger={
              <Button size={"lg"} className="text-xl shadow-md" variant={"outline"}>
                Sell
              </Button>
            }
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
      </div>
    </div>
   
    <Image 
    src="/hero.png"
    alt="hero"
    width={1500}
    height={1500}
    className="w-1/3 h-1/3 hidden md:block"
    />
  </div>
  )
}

export default Hero