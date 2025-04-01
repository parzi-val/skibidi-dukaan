import React from 'react'
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
const Catalog = () => {
    const products = [
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
        {
          name: "Burger",
          price: 250,
          imgSrc: "/panini.jpg",
          isDeliverable: false,
        },
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
        {
          name: "Panini",
          price: 390,
          imgSrc: "/panini.jpg",
          isDeliverable: true,
        },
      ];
  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full">
        <h2 className="text-4xl font-semibold pl-8 mb-8" id="catalog">Available now</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              name={product.name}
              price={product.price}
              imgSrc={product.imgSrc}
              isDeliverable={product.isDeliverable}
            />
          ))}
        </div>
      </div>
  )
}

export default Catalog