// components/EditListingModal.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

const EditListingModal = ({ trigger, open, onOpenChange, listing }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [willDeliver, setWillDeliver] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with listing data when modal opens
  useEffect(() => {
    if (listing && open) {
      setName(listing.name || "");
      setPrice(listing.price || "");
      setDescription(listing.description || "");
      setWillDeliver(listing.isDeliverable || false);
      setImagePreview(listing.imgSrc || null);
    }
  }, [listing, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would handle the API call to update the listing
      // For example:
      // const formData = new FormData();
      // formData.append('id', listing.id);
      // formData.append('name', name);
      // formData.append('price', price);
      // formData.append('description', description);
      // formData.append('willDeliver', willDeliver);
      // if (imageFile) formData.append('image', imageFile);
      // await fetch('/api/listings/update', { method: 'PUT', body: formData });
      
      console.log({ id: listing?.id, name, price, description, willDeliver, imageFile });
      
      // Close modal
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error updating listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Listing</DialogTitle>
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
              Available for Delivery
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingModal;
