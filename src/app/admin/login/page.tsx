
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      // Set a cookie for middleware or other checks if needed
      document.cookie = "kicks_logged_in=true; path=/; max-age=3600";
      router.push("/admin/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ 
        title: "Welcome Back", 
        description: "Accessing admin console...",
      });
      // The useEffect will handle the redirect once auth state updates
    } catch (error: any) {
      setLoading(false);
      toast({ 
        title: "Access Denied", 
        description: "Invalid credentials. Please check your email and password.", 
        variant: "destructive" 
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center bg-primary text-white pb-8">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-secondary" />
          <CardTitle className="text-4xl font-black tracking-tighter">KREATIONS 254</CardTitle>
          <CardDescription className="text-white/70 uppercase tracking-widest text-[10px]">Secure Admin Portal</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@kreations254.com" 
                  className="pl-10 h-12 border-2"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 h-12 border-2"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 transition-all" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Accessing Console...
                </>
              ) : (
                "Sign In to Console"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center gap-2 pb-6 border-t mt-4 pt-4">
          <p className="text-[10px] font-black uppercase text-muted-foreground">
            UNAUTHORIZED ACCESS IS PROHIBITED
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
