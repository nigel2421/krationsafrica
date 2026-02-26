"use client";

import { useState } from "react";
import { useUser, useFirestore, useFirebaseApp } from "@/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Database, Globe } from "lucide-react";

export default function TestPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const app = useFirebaseApp();
  
  const [dbStatus, setDbStatus] = useState<"pending" | "ok" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState("");

  const testConnection = async () => {
    if (!db) return;
    setDbStatus("pending");
    try {
      const q = query(collection(db, "products"), limit(1));
      await getDocs(q);
      setDbStatus("ok");
    } catch (e: any) {
      console.error(e);
      setDbStatus("error");
      setErrorMsg(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-primary uppercase">System Diagnostics</h1>
          <Button variant="ghost" asChild>
            <a href="/admin/dashboard">Back to Dashboard</a>
          </Button>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Authentication</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isUserLoading ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying state...
                </div>
              ) : user ? (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <CheckCircle2 className="h-5 w-5" /> Signed in as {user.email}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive font-bold">
                  <XCircle className="h-5 w-5" /> Not Signed In
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Database Connection</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {dbStatus === "ok" ? (
                  <Badge className="bg-green-500">Connected</Badge>
                ) : dbStatus === "error" ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant="outline">Idle</Badge>
                )}
              </div>
              {dbStatus === "error" && (
                <p className="text-xs text-destructive font-mono bg-destructive/5 p-2 rounded">{errorMsg}</p>
              )}
              <Button onClick={testConnection} disabled={!db} className="w-full">
                Test Read Operation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">App Config</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-xs font-mono bg-muted p-4 rounded overflow-auto">
              <pre>{JSON.stringify(app.options, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
