'use client';

import { loginUser, registerUser } from '@/services/authService';
import { useRouter } from 'next/navigation';


import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Navbar from "../Navbar";
import { toast } from 'sonner';
import axios from 'axios';

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roomNo: "",
    phoneNo: "",
    agreeToTerms: false
  });
  

  const handleLoginSubmit = async (e:any) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await loginUser(loginForm.email, loginForm.password);
      console.log("Login successful:", result);
      
      // Redirect to dashboard or home page
      router.push('/');
    } catch (err:any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate passwords match
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      // First step: Send phone number to get OTP
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/otp/send-otp`, {
        phoneNo: signupForm.phoneNo
      });
      
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent to your phone number");
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      console.error("OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTPAndRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Verify OTP
      const verifyResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/otp/verify-otp`, {
        phoneNo: signupForm.phoneNo,
        otp: otp
      });
      
      if (!verifyResponse.data.success) {
        throw new Error("Invalid OTP");
      }
      
      // Complete registration
      const result = await registerUser({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        roomNo: signupForm.roomNo,
        phoneNo: signupForm.phoneNo
      });
      
      console.log("Registration successful:", result);
      
      // Reset OTP state
      setOtpSent(false);
      setOtp("");
      
      // Switch to login tab
      setActiveTab("login");
      
      // Show success message
      toast.success("Account created successfully! Please login.");
      
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  const updateLoginForm = (field:any, value:any) => {
    setLoginForm({
      ...loginForm,
      [field]: value
    });
  };

  const updateSignupForm = (field:any, value:any) => {
    setSignupForm({
      ...signupForm,
      [field]: value
    });
  };

  return (
    <div className="min-h-screen w-[85vw] bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Left side - Branding and info */}
          <div className="w-full lg:w-1/2 max-w-md">
            <h1 className="text-4xl font-bold mb-4">SkibidiDukaan</h1>
            <p className="text-xl text-gray-600 mb-6">Because everyone gets hungry, after the store is closed.</p>
            
            <div className="space-y-12 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Find unique products</h3>
                  <p className="text-gray-600">Whatever these freaks try selling, you can buy.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Support broke students.</h3>
                  <p className="text-gray-600">Autowalahs took all our money, so help.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Sell your own stuff</h3>
                  <p className="text-gray-600">Bought too much lays? Sell that shi. </p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image 
                  src="/marketplace.jpg" 
                  alt="SkibidiDukaan Marketplace" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Right side - Auth form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <Card className="w-full">
                
                <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
               
              
              <CardContent>
                <TabsContent value="login">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        required
                        value={loginForm.email}
                        onChange={(e) => updateLoginForm('email', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          required
                          value={loginForm.password}
                          onChange={(e) => updateLoginForm('password', e.target.value)}
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-me" 
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => updateLoginForm('rememberMe', checked)}
                      />
                      <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="space-y-2">
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        required
                        value={signupForm.name}
                        onChange={(e) => updateSignupForm('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        required
                        value={signupForm.email}
                        onChange={(e) => updateSignupForm('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomNo">Room Number</Label>
                      <Input 
                        id="roomNo" 
                        placeholder="S-322" 
                        required
                        value={signupForm.roomNo}
                        onChange={(e) => updateSignupForm('roomNo', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNo">Phone Number</Label>
                      <div className="flex">
                        <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                          +91
                        </div>
                        <Input 
                          id="phoneNo" 
                          type="tel" 
                          className="rounded-l-none"
                          placeholder="9876543210" 
                          required
                          maxLength={10}
                          value={signupForm.phoneNo}
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, '');
                            // Limit to 10 digits
                            const truncated = value.slice(0, 10);
                            updateSignupForm('phoneNo', truncated);
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Enter 10 digit mobile number without country code</p>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input 
                          id="signup-password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          required
                          value={signupForm.password}
                          onChange={(e) => updateSignupForm('password', e.target.value)}
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                        value={signupForm.confirmPassword}
                        onChange={(e) => updateSignupForm('confirmPassword', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        required
                        checked={signupForm.agreeToTerms}
                        onCheckedChange={(checked) => updateSignupForm('agreeToTerms', checked)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms of Service
                        </Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input 
                          id="otp" 
                          type="text" 
                          placeholder="Enter OTP sent to your phone" 
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          onClick={verifyOTPAndRegister} 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? "Verifying..." : "Verify & Register"}
                        </Button>
                      </div>
                    )}
                    
                    {!otpSent && (
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending OTP..." : "Get OTP & Continue"}
                      </Button>
                    )}
                  </form>
                </TabsContent>
              </CardContent>

              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}