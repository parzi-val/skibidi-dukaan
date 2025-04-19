"use client"
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface AddListingModalProps {
  trigger: any;
  open: any;
  onOpenChange: (open: any) => any;
}
const AddListingModal = ({ trigger, open, onOpenChange }: AddListingModalProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [willDeliver, setWillDeliver] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication on component mount
  useEffect(() => {
    const token = getCookie('token');
    if (!token && open) {
      toast.error("You must be logged in to add a listing", {
        description: "Please log in to continue"
      });
      if (onOpenChange) onOpenChange(false);
      router.push('/login');
    } else {
      setIsAuthenticated(!!token);
    }
  }, [open, onOpenChange, router]);

  const handleImageChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get JWT token from cookies
      const token = getCookie('token');
      
      if (!token) {
        toast.error("You must be logged in to create a listing", {
          description: "Authentication required"
        });
        if (onOpenChange) onOpenChange(false);
        router.push('/login');
        return;
      }
      
      // Create FormData for the API request
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('quantity', quantity.toString());
      formData.append('deliverable', willDeliver.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Make API request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/snacks/create`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Handle successful response
      console.log("Listing created:", response.data);
      
      toast.success("Your listing has been created", {
        description: "Success!"
      });
      
      // Reset form
      setName("");
      setPrice("");
      setQuantity(1);
      setDescription("");
      setWillDeliver(false);
      setImageFile(null);
      setImagePreview(null);
      
      // Close modal
      if (onOpenChange) onOpenChange(false);
    } catch (error:any) {
      console.error("Error creating listing:", error);
      
      if (error.response?.status === 401) {
        toast.error("Your session has expired", {
          description: "Please log in again"
        });
        if (onOpenChange) onOpenChange(false);
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to create listing. Please try again.", {
          description: "Error"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get cookie value
  const getCookie = (name:any) => {
    const value = `; ${document.cookie}`;
    const parts:any = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // If not authenticated, don't render the dialog content
  if (!isAuthenticated && open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // If trying to open and not authenticated, redirect to login
      if (newOpen && !isAuthenticated) {
        toast.error("You must be logged in to add a listing", {
          description: "Please log in to continue"
        });
        router.push('/login');
        return;
      }
      // Otherwise, handle normally
      if (onOpenChange) onOpenChange(newOpen);
    }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Listing</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Panini Sandwich" 
              required 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input 
              id="price" 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="e.g., 250" 
              required 
              min="0"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))} 
              placeholder="e.g., 1" 
              required 
              min="1"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe your item..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="willDeliver" className="cursor-pointer">
              Will Deliver to Room
            </Label>
            <Switch 
              id="willDeliver" 
              checked={willDeliver} 
              onCheckedChange={setWillDeliver} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image">Product Image</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            
            {imagePreview && (
              <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Add Listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListingModal;
