import Image from "next/image";
import Navbar from "./Navbar";
import Hero from "./Hero";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

export default function Home() {
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
    <div className="h-full font-[family-name:var(--font-raleway)] w-[85vw]">
      <Navbar />
      <Hero />
      <div className="min-h-screen">
        <h2 className="text-4xl font-semibold pl-8 mb-8">Available now</h2>
        <div className="grid grid-cols-4 gap-4">
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
    </div>
  );
}
