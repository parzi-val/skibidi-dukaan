'use client';

import React, { useState } from 'react';
import Navbar from '../Navbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from 'next/image';
import { useCart } from '@/context/cart'; // Import the cart context
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CheckoutSuccessModal from '../CheckoutSuccessModal';


const Cart = () => {
  // Get cart items and functions from context
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  // State for checkout modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phoneNumber: '',
    roomNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // You can calculate this based on your business logic
  const tax = 0; // You can calculate this based on your business logic
  const total = subtotal + shipping + tax;

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  // Handle input changes in the checkout form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // try {
    //   // Check with backend if the requested quantity is available
    //   const response = await axios.post(
    //     `${process.env.NEXT_PUBLIC_API_URL}/cart/`,
    //     {
    //       productId: itemId,
    //       quantity: newQuantity
    //     }
    //   );
      
    //   // If validation passes, update the quantity in the cart
    //   if (response.data.valid) {
    //     updateQuantity(itemId, newQuantity);
    //   } else {

    //     toast.error(response.data.message || "Requested quantity not available", {
    //       description: "Please try a smaller quantity"
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error validating quantity:", error);
    //   toast.error("Could not validate product quantity", {
    //     description: "Please try again later"
    //   });
    // }
  };
  

  // Function to handle checkout process
  const handleCheckout = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customerInfo,
        items: cartItems,
        totalAmount: total
      };
      console.log(JSON.stringify(orderData))
      // Send to backend
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/checkout`, 
        orderData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle successful order
      toast.success("Order placed successfully!", {
        description: "Leave a review!"
      });
      setOrderResult(response.data);
      
      // Close checkout modal and open success modal
      setIsCheckoutModalOpen(false);
      setIsSuccessModalOpen(true);
      // Clear the cart
      clearCart();
      
      // Close the modal
      setIsCheckoutModalOpen(false);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to place order", {
        description: error.response?.data?.message || "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open checkout modal
  const openCheckoutModal = () => {
    if (isCartEmpty) {
      toast.error("Your cart is empty", {
        description: "Add some items before checking out."
      });
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className='h-full font-[family-name:var(--font-raleway)] w-[85vw]'>
      <Navbar />
      <CheckoutSuccessModal 
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        orderData={orderResult || { deliverable: [], nonDeliverable: [] }}
      />
      <h2 className="text-6xl font-semibold pl-8 mt-8 mb-8">Your Cart</h2>

      {isCartEmpty ? (
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingBag size={72} className="text-gray-300 mb-4" />
          <h3 className="text-2xl font-medium text-gray-500 mb-4">Your cart is empty</h3>
          <Link href="/#catalog">
            <Button className="mt-2">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4 flex ">
                <div className="w-20 h-20 relative mr-4 bg-gray-100 rounded">
                  <Image
                    src={item.imgSrc || item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.isDeliverable ? "Will Deliver" : "Pickup Only"}
                      </div>
                    </div>
                    <div className="text-lg font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border rounded-md">
                    <button 
                      className="px-2 py-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button 
                      className="px-2 py-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>

                    </div>
                    
                    <button 
                      className="text-red-500 hover:text-red-700" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Order Summary - Takes up 1/3 of the space on larger screens */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={openCheckoutModal}>
                Proceed to Checkout
              </Button>
              <Link href="/#catalog">
                <Button variant="outline" className="w-full mt-3">Continue Shopping</Button>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCheckout} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                value={customerInfo.name} 
                onChange={handleInputChange} 
                placeholder="Enter your full name" 
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber" 
                name="phoneNumber"
                value={customerInfo.phoneNumber} 
                onChange={handleInputChange} 
                placeholder="Enter your phone number" 
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input 
                id="roomNumber" 
                name="roomNumber"
                value={customerInfo.roomNumber} 
                onChange={handleInputChange} 
                placeholder="Enter your room number" 
                required 
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCheckoutModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
