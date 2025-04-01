'use client';

import React, { useState } from 'react';
import Navbar from '../Navbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from 'next/image';

const Cart = () => {
  // Sample cart data - in a real app, this would come from your state management solution
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 149.99,
      quantity: 1,
      image: "/panini.jpg",
      isDeliverable: true
    },
    {
      id: 2,
      name: "Mechanical Keyboard",
      price: 89.99,
      quantity: 2,
      image: "/panini.jpg",
      isDeliverable: false
    },
    {
      id: 3,
      name: "Ergonomic Mouse",
      price: 59.99,
      quantity: 1,
      image: "/panini.jpg",
      isDeliverable: true
    }
  ]);

  // Cart manipulation functions
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? {...item, quantity: newQuantity} : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;
  const tax = 0;
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
          <Button className="mt-2">Continue Shopping</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4 flex ">
                <div className="w-20 h-20 relative mr-4 bg-gray-100 rounded">
                  <Image
                    src={item.image}
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
                      onClick={() => removeItem(item.id)}
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
              
              <Button className="w-full mt-6">Proceed to Checkout</Button>
              <Button variant="outline" className="w-full mt-3">Continue Shopping</Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;