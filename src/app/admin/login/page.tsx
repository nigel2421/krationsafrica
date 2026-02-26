"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Chrome } from "lucide-react";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      // If already logged in, we check if they are admin later
      // But for UX, we redirect to dashboard and let it handle the role check
      router.push("/admin/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sync user profile with role
      const userRef = doc(db, "userProfiles", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const role = user.email === "nigel2421@gmail.com" ? "admin" : "customer";
        await setDoc(userRef, {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      router.push("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
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
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-black text-primary tracking-tighter">KREATION 254</CardTitle>
          <CardDescription>Sign in to access your orders and dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline"
            className="w-full h-14 text-lg font-bold flex items-center justify-center gap-3 border-2 hover:bg-muted"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-6 w-6" />}
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Secure Authentication</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col text-center gap-2">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}