"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, LayoutDashboard, LogOut, Sparkles, Loader2, Check, Tag, Layers, AlertCircle, Info, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/admin/media-library";
import { generateProductDescription } from "@/ai/flows/admin-product-description-generator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    category: "Sneakers",
    gender: "Unisex",
    stockStatus: "In Stock",
    description: "",
    materials: "",
    imageUrl: "",
    availableSizes: [] as string[],
  });

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: products, isLoading: productsLoading, error: productsError } = useCollection(productsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, isUserLoading, router]);

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter(s => s !== size)
        : [...prev.availableSizes, size]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const data = {
        ...form,
        price: parseFloat(form.price),
        slug,
        updatedAt: serverTimestamp(),
        createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), data);
        toast({ title: "Product Updated" });
      } else {
        await addDoc(collection(db, "products"), data);
        toast({ title: "Product Created" });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setAiError(null);
    setForm({
      name: "",
      brand: "",
      price: "",
      category: "Sneakers",
      gender: "Unisex",
      stockStatus: "In Stock",
      description: "",
      materials: "",
      imageUrl: "",
      availableSizes: [],
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setAiError(null);
    setForm({
      name: product.name,
      brand: product.brand || "",
      price: product.price.toString(),
      category: product.category,
      gender: product.gender || "Unisex",
      stockStatus: product.stockStatus,
      description: product.description || "",
      materials: product.materials || "",
      imageUrl: product.imageUrl,
      availableSizes: product.availableSizes || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        toast({ title: "Product Deleted" });
      } catch (e: any) {
        toast({ title: "Delete Failed", description: e.message, variant: "destructive" });
      }
    }
  };

  const handleAiGenerate = async () => {
    if (!form.name || !form.category) {
      toast({ title: "Details Required", description: "Enter shoe name and category first.", variant: "destructive" });
      return;
    }
    setIsAiGenerating(true);
    setAiError(null);
    try {
      const result = await generateProductDescription({
        shoeName: form.name,
        category: form.category,
        material: form.materials,
        occasion: form.category === 'Official' ? 'Formal' : 'Casual',
      });
      setForm({ ...form, description: result.description });
      toast({ title: "AI Generation Complete" });
    } catch (e: any) {
      console.error("AI Generation Error:", e);
      let msg = "AI generation failed. Please try again later.";
      if (e.message?.includes("403") || e.message?.includes("blocked") || e.message?.includes("disabled")) {
        msg = "Generative Language API is blocked or disabled. You must enable it in the Google Cloud Console to use AI features.";
      }
      setAiError(msg);
      toast({ title: "AI Tool Blocked", description: "Please check your API settings.", variant: "destructive" });
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="bg-primary text-white border-b">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-8 w-8 text-secondary" />
            <h1 className="text-2xl font-black tracking-tight uppercase">Admin CMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <a href="/test">System Health</a>
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => signOut(auth)}>
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-12">
        {productsError && (
          <Alert variant="destructive" className="mb-8 border-2 animate-pulse">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-tight">Database Connection Blocked</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="font-bold text-sm">
                Your browser or network is blocking the connection to the database.
              </p>
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <h4 className="font-black text-xs uppercase mb-2">Required Action:</h4>
                <ol className="list-decimal list-inside text-xs space-y-1 font-medium">
                  <li>Disable your Ad-Blocker (uBlock Origin, AdBlock, etc.)</li>
                  <li>If using Brave, turn off "Shields" for this site.</li>
                  <li>Refresh this page.</li>
                </ol>
              </div>
              <p className="text-[10px] opacity-70 italic font-mono">
                Error Detail: {productsError.message}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-primary">Inventory Management</h2>
            <p className="text-muted-foreground">Manage your shoe catalog with precision.</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setDialogOpen(true);
          }} className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold w-full md:w-auto">
            <Plus className="mr-2 h-5 w-5" /> Add New Product
          </Button>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden">
          {productsLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-secondary" />
              <p className="font-bold text-muted-foreground">Loading inventory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Shoe Details</TableHead>
                    <TableHead>Category/Gender</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden border bg-muted">
                          <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{product.name}</span>
                          <span className="text-xs text-muted-foreground uppercase font-semibold">{product.brand || 'No Brand'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{product.gender}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={product.stockStatus === "In Stock" ? "default" : product.stockStatus === "Few Left" ? "secondary" : "destructive"}
                            className="w-fit text-[10px]"
                          >
                            {product.stockStatus}
                          </Badge>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            Sizes: {product.availableSizes?.join(", ") || "None"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-secondary">KES {product.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              {editingProduct ? "Edit Product Listing" : "Create New Product Listing"}
            </DialogTitle>
            <DialogDescription>Provide comprehensive details to attract more customers.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
            {aiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Tool Blocked</AlertTitle>
                <AlertDescription className="text-xs">
                  {aiError}
                  <div className="mt-2">
                    <Button variant="link" className="p-0 h-auto text-xs text-destructive underline font-bold" asChild>
                      <a href="https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=782503041956" target="_blank">
                        Enable Generative Language API <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Tag className="h-4 w-4" /> Shoe Name</Label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Air Jordan 1 Retro" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Check className="h-4 w-4" /> Brand</Label>
                    <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Nike" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (KES)</Label>
                    <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="15000" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Materials</Label>
                    <input value={form.materials} onChange={e => setForm({...form, materials: e.target.value})} placeholder="e.g. Leather, Suede" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sneakers">Sneakers</SelectItem>
                        <SelectItem value="Boots">Boots</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Official">Official</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Men">Men</SelectItem>
                        <SelectItem value="Women">Women</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                        <SelectItem value="Kids">Kids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2"><Layers className="h-4 w-4" /> Available Sizes (EU)</Label>
                  <div className="flex flex-wrap gap-2">
                    {SHOE_SIZES.map(size => (
                      <div key={size} className="flex items-center space-x-2 bg-muted p-2 rounded-md hover:bg-muted/80 cursor-pointer">
                        <Checkbox 
                          id={`size-${size}`} 
                          checked={form.availableSizes.includes(size)} 
                          onCheckedChange={() => toggleSize(size)}
                        />
                        <Label htmlFor={`size-${size}`} className="text-xs font-bold">{size}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label>Description</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAiGenerate} disabled={isAiGenerating} className="h-7 text-[10px] font-bold uppercase text-secondary">
                      {isAiGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Generate AI Copy
                    </Button>
                  </div>
                  <Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed product features..." />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Stock Availability</Label>
                  <Select value={form.stockStatus} onValueChange={v => setForm({...form, stockStatus: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Few Left">Few Left</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Product Visual Selection</Label>
                  <MediaLibrary 
                    selectedUrl={form.imageUrl} 
                    onSelect={(url) => setForm({...form, imageUrl: url})} 
                  />
                  {form.imageUrl && (
                    <div className="relative aspect-square max-w-[200px] rounded-xl overflow-hidden border-4 border-secondary/20 mx-auto">
                      <img src={form.imageUrl} alt="Preview" className="object-cover h-full w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t pt-6">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Discard Changes</Button>
              <Button type="submit" disabled={!form.imageUrl} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black px-12 uppercase">
                {editingProduct ? "Update Listing" : "Publish Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}