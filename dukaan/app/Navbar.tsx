'use client';
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddListingModal from "./AddListingModal";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <nav className="flex justify-between items-center p-4 rounded-lg">
      <Link href="/" className=" ">
        <Image 
        alt="SkibidiDukaan"
        src="/logo.png"
        height={1000}
        width={1000}
        className="w-20 h-20"
        />
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:gap-6">
        <Link href="/#catalog" className="text-gray-600 hover:text-gray-900 transition">
          Browse
        </Link>
        
        <AddListingModal 
                trigger={
                  <p className="text-gray-600 hover:text-gray-900 transition hover:cursor-pointer">Sell</p>
                }
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
          />
      </div>
      
      <div className="hidden md:flex md:gap-3">
        <Link href="/cart">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart size={18} />
            Cart
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Account</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/login">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Mobile Navigation */}
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/cart">
          <Button variant="outline" size="icon">
            <ShoppingCart size={18} />
          </Button>
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col ml-4 gap-6 mt-10">
              <Link href="/#catalog" className="text-lg font-medium">
                <SheetClose className="w-full text-left">Browse</SheetClose>
              </Link>
              <AddListingModal 
                trigger={
                  <SheetClose className="w-full text-left">Sell</SheetClose>
                }
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
              />
                
             
              <div className="h-px bg-gray-200 my-2"></div>
              <Link href="/login" className="text-lg font-medium">
                <SheetClose className="w-full text-left">Profile</SheetClose>
              </Link>
              <Link href="/profile" className="text-lg font-medium">
                <SheetClose className="w-full text-left">Orders</SheetClose>
              </Link>
              <Link href="/logout" className="text-lg font-medium">
                <SheetClose className="w-full text-left">Logout</SheetClose>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}