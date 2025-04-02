'use client';

import React from 'react';
import Navbar from '../Navbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from 'next/image';
import { useCart } from '@/context/cart'; // Import the cart context
import Link from 'next/link';

const Cart = () => {
  // Get cart items and functions from context
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // You can calculate this based on your business logic
  const tax = 0; // You can calculate this based on your business logic
  const total = subtotal + shipping + tax;

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  return (
    <div className='h-full font-[family-name:var(--font-raleway)] w-[85vw]'>
      <Navbar />
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
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
              
              <Button className="w-full mt-6" onClick={handleCheckout}>Proceed to Checkout</Button>
              <Link href="/#catalog">
                <Button variant="outline" className="w-full mt-3">Continue Shopping</Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// Function to handle checkout process
const handleCheckout = async () => {
  // Get the token if user is logged in
  const token = getCookie('token');
  
  if (!token) {
    // If user is not logged in, redirect to login page
    // You can use next/navigation for this
    window.location.href = '/login?redirect=checkout';
    return;
  }
  
  // If user is logged in, proceed with checkout
  // Here you would typically send the cart data to your backend
  try {
    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Send to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items: cartItems })
    });
    
    if (response.ok) {
      // Redirect to order confirmation page
      window.location.href = '/order-confirmation';
    } else {
      throw new Error('Checkout failed');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    // Show error message
  }
};

// Helper function to get cookie
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export default Cart;
