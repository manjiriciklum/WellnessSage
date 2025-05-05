import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  
  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Authentication`,
      description: `${provider} authentication requires credentials. Please use username/password login for now.`,
      variant: "destructive"
    });
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left side - Auth forms */}
        <div className="w-full max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Account Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        required
                        value={loginForm.username}
                        onChange={handleLoginChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={loginForm.password}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="flex items-center justify-center"
                        onClick={() => handleSocialLogin('Google')}
                      >
                        <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                        Google
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="flex items-center justify-center"
                        onClick={() => handleSocialLogin('Facebook')}
                      >
                        <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
                        Facebook
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Enter your information to create a new account.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          value={registerForm.firstName}
                          onChange={handleRegisterChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          value={registerForm.lastName}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        name="username"
                        required
                        value={registerForm.username}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        name="password"
                        type="password"
                        required
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full" type="submit" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or sign up with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="flex items-center justify-center"
                        onClick={() => handleSocialLogin('Google')}
                      >
                        <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                        Google
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="flex items-center justify-center"
                        onClick={() => handleSocialLogin('Facebook')}
                      >
                        <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
                        Facebook
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side - Platform intro */}
        <div className="hidden lg:block text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Ciklum's HealthAI Platform
          </h1>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            Your comprehensive health management system with personalized insights, wearable
            integration, and AI-powered health coaching.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-2">Health Insights</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Get personalized analytics based on your health data
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-2">Device Integration</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Connect your wearable devices for real-time tracking
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-2">AI Health Coach</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Receive AI-powered health recommendations and guidance
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-2">Doctor Connection</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Find and connect with healthcare professionals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;