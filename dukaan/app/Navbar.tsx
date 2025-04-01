import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 rounded-lg ">
      <Link href="/" className="text-xl font-bold text-persian">
        SkibidiDukaan
      </Link>

      <div className="flex gap-6">
        <Link href="/products" className="text-gray-600 hover:text-persian transition">
          Browse
        </Link>
        <Link href="/sell" className="text-gray-600 hover:text-persian transition">
          Sell
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders">Orders</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/logout">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
