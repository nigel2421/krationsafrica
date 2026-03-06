"use client";

import { useState } from "react";
import { useUser, useFirestore, useFirebaseApp } from "@/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Database, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TestPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const app = useFirebaseApp();
  
  const [dbStatus, setDbStatus] = useState<"pending" | "ok" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState("");
  const [testResults, setTestResults] = useState<{name: string, status: 'pass' | 'fail' | 'pending'}[]>([
    { name: "Firebase Initialization", status: 'pass' },
    { name: "Auth Service", status: 'pending' },
    { name: "Firestore Read", status: 'pending' },
    { name: "Storage Access", status: 'pending' },
  ]);

  const testConnection = async () => {
    if (!db) return;
    setDbStatus("pending");
    try {
      const q = query(collection(db, "products"), limit(1));
      await getDocs(q);
      setDbStatus("ok");
      updateTestStatus("Firestore Read", "pass");
    } catch (e: any) {
      console.error(e);
      setDbStatus("error");
      setErrorMsg(e.message);
      updateTestStatus("Firestore Read", "fail");
    }
  };

  const updateTestStatus = (name: string, status: 'pass' | 'fail') => {
    setTestResults(prev => prev.map(t => t.name === name ? { ...t, status } : t));
  };

  return (
    <div className="min-h-screen bg-muted/10 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">System Diagnostics</h1>
            <p className="text-muted-foreground text-sm font-medium">Verify your setup before shipping to production.</p>
          </div>
          <Button variant="ghost" asChild className="font-bold">
            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
        </div>
        
        <div className="grid gap-6">
          {/* Quick Checklist */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest">Pre-Flight Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {testResults.map((test, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="text-sm font-bold uppercase">{test.name}</span>
                  {test.status === 'pass' ? (
                    <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> OK</Badge>
                  ) : test.status === 'fail' ? (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> FAILED</Badge>
                  ) : (
                    <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> WAITING</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Authentication State</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isUserLoading ? (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-secondary" /> Verifying session...
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 font-black uppercase text-xs">
                    <CheckCircle2 className="h-5 w-5" /> Signed in Successfully
                  </div>
                  <div className="p-3 bg-muted rounded text-[10px] font-mono break-all">
                    UID: {user.uid}<br/>
                    Email: {user.email}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-destructive font-black uppercase text-xs">
                    <XCircle className="h-5 w-5" /> Not Signed In
                  </div>
                  <Button asChild size="sm" variant="outline" className="font-bold uppercase text-[10px]">
                    <Link href="/admin/login">Go to Login</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Live Database Sync</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-muted-foreground">Read Permissions</span>
                {dbStatus === "ok" ? (
                  <Badge className="bg-green-500 font-black uppercase text-[10px]">Active</Badge>
                ) : dbStatus === "error" ? (
                  <Badge variant="destructive" className="font-black uppercase text-[10px]">Blocked</Badge>
                ) : (
                  <Badge variant="outline" className="font-black uppercase text-[10px]">Testing...</Badge>
                )}
              </div>
              
              {dbStatus === "error" && (
                <div className="p-4 bg-destructive/5 border-2 border-destructive/20 rounded-xl space-y-2">
                  <p className="text-[10px] font-black uppercase text-destructive">Error Details:</p>
                  <p className="text-xs font-medium text-destructive leading-relaxed">{errorMsg}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase italic">
                    Note: If this says "Missing Permissions" but rules are public, please disable your Ad-Blocker.
                  </p>
                </div>
              )}
              
              <Button onClick={testConnection} disabled={!db} className="w-full h-12 font-black uppercase tracking-widest">
                {dbStatus === "pending" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Trigger Firestore Read
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4" /> Environment Config
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="text-[9px] font-mono p-6 bg-black text-green-400 overflow-auto max-h-40 leading-tight">
                {JSON.stringify({
                  projectId: app.options.projectId,
                  authDomain: app.options.authDomain,
                  storageBucket: app.options.storageBucket,
                  environment: process.env.NODE_ENV
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">
            KREATIONS KICKS 254 • INTERNAL DIAGNOSTICS
          </p>
        </div>
      </div>
    </div>
  );
}
