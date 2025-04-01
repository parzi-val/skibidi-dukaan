import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '../Navbar';

const SellerProfile = () => {
  // Mock seller data
  const seller = {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    joinedDate: "April 2023",
    avatar: "/avatar.jpg",
    totalSales: 28,
  };

  // Mock product listings with status
  const listings = [
    {
      id: 1,
      name: "Panini",
      price: 390,
      imgSrc: "/panini.jpg",
      isDeliverable: true,
      status: "active",
      dateAdded: "2025-03-28",
      views: 45,
    },
    {
      id: 2,
      name: "Burger",
      price: 250,
      imgSrc: "/panini.jpg",
      isDeliverable: false,
      status: "sold",
      dateAdded: "2025-03-15",
      views: 112,
      soldDate: "2025-03-30",
    },
    {
      id: 3,
      name: "Chicken Sandwich",
      price: 320,
      imgSrc: "/panini.jpg",
      isDeliverable: true,
      status: "pending",
      dateAdded: "2025-04-01",
      views: 12,
    },
    {
      id: 4,
      name: "Veggie Wrap",
      price: 280,
      imgSrc: "/panini.jpg",
      isDeliverable: true,
      status: "active",
      dateAdded: "2025-03-25",
      views: 38,
    },
  ];

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return "bg-green-500";
      case 'sold':
        return "bg-blue-500";
      case 'pending':
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className='w-[85vw]'>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
      {/* Seller Profile Header */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{seller.name}</CardTitle>
            <CardDescription>{seller.email}</CardDescription>
            <CardDescription>Total sales: {seller.totalSales}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Listings Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Listings</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="sold">Sold</TabsTrigger>
        </TabsList>

        {/* All Listings Tab */}
        <TabsContent value="all">
          <h2 className="text-2xl font-semibold mb-4">All Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>

        {/* Active Listings Tab */}
        <TabsContent value="active">
          <h2 className="text-2xl font-semibold mb-4">Active Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings
              .filter((listing) => listing.status === "active")
              .map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
          </div>
        </TabsContent>

        {/* Sold Listings Tab */}
        <TabsContent value="sold">
          <h2 className="text-2xl font-semibold mb-4">Sold Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings
              .filter((listing) => listing.status === "sold")
              .map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
          </div>
        </TabsContent>

        {/* Pending Listings Tab */}
        <TabsContent value="pending">
          <h2 className="text-2xl font-semibold mb-4">Pending Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings
              .filter((listing) => listing.status === "pending")
              .map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
    
  );
};

const ListingCard = ({ listing }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={listing.imgSrc}
          alt={listing.name}
          className="h-full w-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${
            listing.status === 'active' ? 'bg-green-500' : 
            listing.status === 'sold' ? 'bg-blue-500' : 
            'bg-yellow-500'
          }`}
        >
          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{listing.name}</h3>
          <span className="font-bold">₹{listing.price}</span>
        </div>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Listed: {new Date(listing.dateAdded).toLocaleDateString()}</p>
          <p>Views: {listing.views}</p>
          {listing.isDeliverable ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Delivery Available
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              No Delivery
            </Badge>
          )}
          {listing.soldDate && (
            <p>Sold on: {new Date(listing.soldDate).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Edit
        </Button>

      </CardFooter>
    </Card>
  );
};

export default SellerProfile;
