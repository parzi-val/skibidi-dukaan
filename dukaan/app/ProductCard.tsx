'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from '@/context/cart'; // Import the custom hook

const ProductCard = ({ 
  id,
  name = "Panini",
  price = 390,
  imgSrc = "/panini.jpg",
  isDeliverable = true,
  room = "IDKth floor"
}) => {
  const { addToCart } = useCart(); // Use the cart context
  
  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      imgSrc,
      isDeliverable,
    });
  };

  return (
    <Card className="w-72 overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="relative h-30 md:h-48 overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      
      <CardHeader className="md:p-4 pb-0">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold line-clamp-2 min-h-[3.5rem]">{name}</h3>
          <Badge variant={isDeliverable ? "default" : "secondary"} className="ml-2 text-sm">
            {isDeliverable ? "Will Deliver" : "Pickup Only"}
          </Badge>
        </div>
        <div className='text-right'>
        <Badge variant={"outline"} className={isDeliverable ? "invisible" : ""}>
          {room}
        </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="md:p-4 pt-2">
        <p className="text-xl font-bold text-gray-900">
          ₹{typeof price === 'number' ? price.toFixed(2) : price}
        </p>
      </CardContent>
      
      <CardFooter className="md:p-4 pt-0">
        <Button 
          onClick={handleAddToCart} 
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
