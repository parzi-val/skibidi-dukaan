'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddListingModal from "./AddListingModal";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import axios from "axios";
import { toast } from "sonner";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in and get user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('token');
      
      if (token) {
        try {
          // You can either make an API call to get user info
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/whoami`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setUserName(response.data.name || "User");
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Helper function to get cookie
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };


  // Logout function
  const handleLogout = () => {
    // Remove the token
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Update state
    setIsLoggedIn(false);
    setUserName("");
    // Show a toast notification
    toast.success("Logged out successfully");
  };

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
            <Button variant="outline" className="flex items-center gap-2">
              <User size={16} />
              {isLoading ? "Loading..." : isLoggedIn ? userName : "Account"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isLoggedIn ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login?tab=signup">Start Selling</Link>
                </DropdownMenuItem>
              </>
            )}
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
              {/* ... (other menu items) ... */}
              
              {isLoggedIn ? (
                <>
                  <div className="text-lg font-bold mb-2">{userName}</div>
                  <Link href="/profile" className="text-lg font-medium">
                    <SheetClose className="w-full text-left">Profile</SheetClose>
                  </Link>
                  <button onClick={handleLogout} className="text-lg font-medium text-left">
                    <SheetClose className="w-full text-left">Logout</SheetClose>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-lg font-medium">
                    <SheetClose className="w-full text-left">Login</SheetClose>
                  </Link>
                  <Link href="/login?tab=signup" className="text-lg font-medium">
                    <SheetClose className="w-full text-left">Sign Up</SheetClose>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}