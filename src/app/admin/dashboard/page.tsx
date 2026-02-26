
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, LayoutDashboard, Package, Image as ImageIcon, LogOut, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/admin/media-library";
import { generateProductDescription } from "@/ai/flows/admin-product-description-generator";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Sneakers",
    stockStatus: "In Stock",
    description: "",
    imageUrl: "",
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
        fetchProducts();
      } else {
        router.push("/admin/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        createdAt: editingProduct ? editingProduct.createdAt : new Date(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), data);
        toast({ title: "Product Updated" });
      } else {
        await addDoc(collection(db, "products"), data);
        toast({ title: "Product Created" });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setForm({ name: "", price: "", category: "Sneakers", stockStatus: "In Stock", description: "", imageUrl: "" });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stockStatus: product.stockStatus,
      description: product.description || "",
      imageUrl: product.imageUrl,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    }
  };

  const handleAiGenerate = async () => {
    if (!form.name || !form.category) {
      toast({ title: "Details Required", description: "Enter shoe name and category first.", variant: "destructive" });
      return;
    }
    setIsAiGenerating(true);
    try {
      const result = await generateProductDescription({
        shoeName: form.name,
        category: form.category,
      });
      setForm({ ...form, description: result.description });
      toast({ title: "AI Generation Complete" });
    } catch (e) {
      toast({ title: "AI Failed", variant: "destructive" });
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="bg-primary text-white border-b">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-8 w-8 text-secondary" />
            <h1 className="text-2xl font-black tracking-tight uppercase">Admin CMS</h1>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => signOut(auth)}>
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-primary">Inventory Management</h2>
            <p className="text-muted-foreground">Add and manage shoes in your catalog.</p>
          </div>
          <Button onClick={() => {
            setEditingProduct(null);
            setForm({ name: "", price: "", category: "Sneakers", stockStatus: "In Stock", description: "", imageUrl: "" });
            setDialogOpen(true);
          }} className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
            <Plus className="mr-2 h-5 w-5" /> Add New Product
          </Button>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-secondary" />
              <p className="font-bold text-muted-foreground">Loading inventory...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
                        <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">KES {product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.stockStatus === "In Stock" ? "default" : product.stockStatus === "Few Left" ? "secondary" : "destructive"}
                      >
                        {product.stockStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingProduct ? "Edit Shoe" : "Add New Shoe"}</DialogTitle>
            <DialogDescription>Fill in the details for your product listing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Shoe Name</Label>
                  <Input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="e.g. Nike Air Max Plus"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (KES)</Label>
                    <Input 
                      type="number" 
                      required 
                      value={form.price} 
                      onChange={e => setForm({...form, price: e.target.value})} 
                      placeholder="12500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sneakers">Sneakers</SelectItem>
                        <SelectItem value="Boots">Boots</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Official">Official</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <Select value={form.stockStatus} onValueChange={v => setForm({...form, stockStatus: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Few Left">Few Left</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label>Product Description</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAiGenerate}
                      disabled={isAiGenerating}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider text-secondary border-secondary/50 hover:bg-secondary/10"
                    >
                      {isAiGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea 
                    rows={4} 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Enter features, materials..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Product Image Selection</Label>
                <MediaLibrary 
                  selectedUrl={form.imageUrl} 
                  onSelect={(url) => setForm({...form, imageUrl: url})} 
                />
                {form.imageUrl && (
                  <div className="mt-4 p-2 border rounded-xl bg-muted/30">
                    <p className="text-xs font-bold mb-2 uppercase text-muted-foreground">Preview:</p>
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img src={form.imageUrl} alt="preview" className="object-cover h-full w-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.imageUrl} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-8">
                {editingProduct ? "Update Product" : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
