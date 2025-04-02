import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from 'next/link';

const CheckoutSuccessModal = ({ open, onOpenChange, orderData }) => {
  const { deliverable, nonDeliverable } = orderData;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Order Confirmed
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Deliverable Items Section */}
          {deliverable && deliverable.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-2">Items for Delivery:</h3>
              <div className="space-y-3">
                {deliverable.map((item, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-md">
                    <p className="font-medium">{item.snack}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Seller: {item.enlistedBy}</p>
                      <p>Phone: {item.phoneNo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Non-Deliverable Items Section */}
          {nonDeliverable && nonDeliverable.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Pickup Only Items:
              </h3>
              <div className="space-y-3">
                {nonDeliverable.map((item, index) => (
                  <div key={index} className="bg-amber-50 p-3 rounded-md">
                    <p className="font-medium">{item.snack}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Seller: {item.enlistedBy}</p>
                      <p>Room: {item.roomNo !== "Not Available" ? item.roomNo : "Contact seller for pickup"}</p>
                      <p>Phone: {item.phoneNo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Thank you for your order! You'll receive a confirmation shortly.
          </div>
        </div>
        
        <DialogFooter>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutSuccessModal;
