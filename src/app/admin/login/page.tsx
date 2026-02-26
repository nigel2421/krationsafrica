"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Chrome, Mail, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, isUserLoading, router]);

  const syncUserProfile = async (user: any) => {
    const userRef = doc(db, "userProfiles", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const role = user.email === "nigel2421@gmail.com" ? "admin" : "customer";
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        name: user.displayName || "Customer",
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return role;
    }
    return userSnap.data()?.role;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
      toast({ title: "Welcome back!" });
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      let message = "Login Failed. Please try again.";
      
      if (error.code === 'auth/operation-not-allowed') {
        message = "Google Sign-In is not enabled in your Firebase Console.";
      } else if (error.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized for Firebase Auth. Add it in the Firebase Console settings.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = "Login popup was closed before completion.";
      }
      
      setAuthError(message);
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncUserProfile(result.user);
      router.push("/admin/dashboard");
    } catch (error: any) {
      setAuthError("Invalid credentials or account does not exist.");
      toast({ title: "Error", description: "Invalid credentials.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden">
        <CardHeader className="space-y-1 text-center bg-primary text-white pb-8">
          <CardTitle className="text-4xl font-black tracking-tighter">KREATION 254</CardTitle>
          <CardDescription className="text-white/70">Secure Access Portal</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <Button 
            variant="outline"
            className="w-full h-14 font-bold flex items-center justify-center gap-3 border-2 hover:bg-muted/50 transition-all text-lg"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-6 w-6" />}
            Continue with Google
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">Or use email login</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
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
                  className="pl-10"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center gap-2 pb-6 border-t mt-4 pt-4">
          <p className="text-xs text-muted-foreground">
            For existing accounts only. New users must sign in with Google.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
