
"use client";

import React, { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Plus, Pencil, Trash2, Sparkles, Loader2, Check, Tag, Layers, Search, Filter } from "lucide-react";
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

const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

export default function AdminInventory() {
  const db = useFirestore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
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

  const productsQuery = useMemoFirebase(() => query(collection(db, "products"), orderBy("createdAt", "desc")), [db]);
  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        toast({ title: "Product Published" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: "", brand: "", price: "", category: "Sneakers", gender: "Unisex",
      stockStatus: "In Stock", description: "", materials: "", imageUrl: "", availableSizes: [],
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      ...product,
      price: product.price.toString(),
    });
    setDialogOpen(true);
  };

  const handleAiGenerate = async () => {
    if (!form.name) return;
    setIsAiGenerating(true);
    try {
      const result = await generateProductDescription({
        shoeName: form.name,
        category: form.category,
        material: form.materials,
      });
      setForm({ ...form, description: result.description });
    } catch (e: any) {
      toast({ title: "AI Error", description: "API enabled?", variant: "destructive" });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Management</h1>
          <p className="text-muted-foreground font-medium">Control your catalog and stock levels.</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="h-12 px-8 font-black uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Plus className="mr-2 h-5 w-5" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl border-2 p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products by name or brand..." 
            className="pl-10 h-10 border-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="font-bold gap-2"><Filter className="h-4 w-4" /> Filters</Button>
        </div>
      </div>

      <div className="bg-white border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" /></TableCell></TableRow>
            ) : filteredProducts?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-14 w-14 rounded-lg overflow-hidden border bg-muted">
                    <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-black text-primary uppercase leading-tight">{product.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{product.brand}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant="outline" className="text-[10px] font-bold uppercase">{product.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge 
                      variant={product.stockStatus === "In Stock" ? "default" : product.stockStatus === "Few Left" ? "secondary" : "destructive"}
                      className="text-[10px] uppercase font-black"
                    >
                      {product.stockStatus}
                    </Badge>
                    <p className="text-[9px] font-bold text-muted-foreground">Sizes: {product.availableSizes?.length || 0}</p>
                  </div>
                </TableCell>
                <TableCell className="font-black text-secondary">KES {product.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if(confirm("Delete?")) deleteDoc(doc(db, "products", product.id)); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">{editingProduct ? "Edit Listing" : "Create Listing"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Shoe Name</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Price (KES)</Label><Input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Materials</Label><Input value={form.materials} onChange={e => setForm({...form, materials: e.target.value})} /></div>
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
                    <Label>Stock Status</Label>
                    <Select value={form.stockStatus} onValueChange={v => setForm({...form, stockStatus: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Few Left">Few Left</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Description</Label><Button type="button" variant="ghost" size="sm" onClick={handleAiGenerate} disabled={isAiGenerating} className="text-secondary font-bold gap-1">{isAiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Copy</Button></div>
                  <Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Available Sizes (EU)</Label>
                <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border">
                  {SHOE_SIZES.map(size => (
                    <div key={size} className="flex items-center space-x-2 bg-white px-3 py-1 rounded border">
                      <Checkbox id={`s-${size}`} checked={form.availableSizes.includes(size)} onCheckedChange={() => toggleSize(size)} />
                      <Label htmlFor={`s-${size}`} className="text-xs font-bold">{size}</Label>
                    </div>
                  ))}
                </div>
                <Label>Product Visuals</Label>
                <MediaLibrary selectedUrl={form.imageUrl} onSelect={url => setForm({...form, imageUrl: url})} />
                {form.imageUrl && <div className="h-40 w-full rounded-xl overflow-hidden border-4 border-secondary/20"><img src={form.imageUrl} className="h-full w-full object-cover" /></div>}
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.imageUrl} className="bg-primary font-black uppercase tracking-widest px-10">
                {editingProduct ? "Save Changes" : "Publish Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
