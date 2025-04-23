"use client"
import React, { useState, useEffect } from 'react';
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import axios from 'axios';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Allow string or null

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/snacks`);
        setProducts(response.data);
        console.log(response.data)
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col mt-20  items-center w-full">
      <h2 className="text-4xl font-semibold pl-8 mb-8" id="catalog">Available now</h2>
      
      {loading && <p>Loading products...</p>}
      
      {error && (
        <div className="text-red-500 mb-4">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </div>
      )}
      
      {!loading && !error && products.length === 0 && (
        <p>No products available at the moment.</p>
      )}
      
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <>
            <ProductCard
              key={product._id || index} 
              id={product._id}
              name={product.name}
              price={product.price}
              imgSrc={product.imgSrc || product.imageUrl}
              isDeliverable={product.isDeliverable || product.deliverable}
              room={`Floor ${product.enlistedBy.roomNo.match(/\d+/)?.[0].slice(0, -2)}`}
            />
            </>
            
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
