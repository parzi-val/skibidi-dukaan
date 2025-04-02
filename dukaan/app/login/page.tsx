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

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  
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
  

  const handleSignupSubmit = async (e:any) => {
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
      const result = await registerUser({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password
      });
      console.log("Registration successful:", result);
      
      // Redirect to dashboard or home page
      router.push('/');
    } catch (err:any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error("Registration error:", err);
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
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 pt-0">
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill="#1877F2"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardFooter>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}