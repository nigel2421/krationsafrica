
"use client";

import React, { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Plus, Pencil, Trash2, Sparkles, Loader2, Search, Filter, Package, Star, Mail, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/admin/media-library";
import { generateProductDescription } from "@/ai/flows/admin-product-description-generator";
import { generateNewsletterHtml } from "@/ai/flows/newsletter-generator";

const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const ITEMS_PER_PAGE = 10;

export default function AdminInventory() {
  const db = useFirestore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Newsletter Logic
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [newsletterHtml, setNewsletterHtml] = useState("");
  const [isGeneratingNewsletter, setIsGeneratingNewsletter] = useState(false);
  const [activeProductForNewsletter, setActiveProductForNewsletter] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    onOffer: false,
    offerPrice: "",
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
  ) || [];

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        offerPrice: form.onOffer ? parseFloat(form.offerPrice) : 0,
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
      name: "", brand: "", price: "", onOffer: false, offerPrice: "", category: "Sneakers", gender: "Unisex",
      stockStatus: "In Stock", description: "", materials: "", imageUrl: "", availableSizes: [],
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      ...product,
      price: product.price.toString(),
      offerPrice: product.offerPrice?.toString() || "",
      onOffer: product.onOffer || false,
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
      toast({ title: "AI Error", variant: "destructive" });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleNewsletterGenerate = async (product: any) => {
    setActiveProductForNewsletter(product);
    setNewsletterOpen(true);
    setNewsletterHtml("");
    setIsGeneratingNewsletter(true);
    try {
      const result = await generateNewsletterHtml({
        shoeName: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        offerPrice: product.onOffer ? product.offerPrice : undefined,
        description: product.description,
        isNewArrival: true,
      });
      setNewsletterHtml(result.html);
    } catch (e: any) {
      toast({ title: "Generation Failed", variant: "destructive" });
    } finally {
      setIsGeneratingNewsletter(false);
    }
  };

  const copyNewsletterHtml = () => {
    navigator.clipboard.writeText(newsletterHtml);
    toast({ title: "HTML Copied", description: "You can now paste this into your email marketing platform." });
  };

  return (
    <div className="space-y-6 pb-20 text-foreground">
       <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Catalog</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Manage your shoe inventory</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search catalog..." 
            className="pl-10 h-10 border-2 bg-background" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="font-black uppercase tracking-widest bg-secondary text-secondary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add New Pair
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-card border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-[10px] uppercase font-black">Visual</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Shoe Name</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Category</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Stock</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Price</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase">Loading Inventory...</TableCell></TableRow>
            ) : paginatedProducts.length > 0 ? paginatedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-12 w-12 rounded-lg overflow-hidden border relative">
                    <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none text-[6px] font-black uppercase -rotate-45">K254</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-primary dark:text-foreground uppercase text-xs">{product.name}</span>
                      {product.onOffer && <Star className="h-3 w-3 text-secondary fill-secondary" />}
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{product.brand}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[9px] font-bold uppercase">{product.category}</Badge></TableCell>
                <TableCell><Badge className="text-[9px] uppercase font-black">{product.stockStatus}</Badge></TableCell>
                <TableCell className="font-black text-secondary text-xs">
                  {product.onOffer ? (
                    <div className="flex flex-col">
                      <span className="text-[8px] text-muted-foreground line-through">KES {product.price.toLocaleString()}</span>
                      <span>KES {product.offerPrice.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span>KES {product.price.toLocaleString()}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" title="Generate Newsletter HTML" onClick={() => handleNewsletterGenerate(product)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"><Mail className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => { if(confirm("Delete?")) deleteDoc(doc(db, "products", product.id)); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase text-muted-foreground">No items found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
        ) : paginatedProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-card border-2 rounded-xl p-3 flex gap-3 shadow-sm">
            <div className="h-20 w-20 rounded-lg overflow-hidden border shrink-0 relative">
              <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none text-[8px] font-black uppercase -rotate-45">K254</div>
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="font-black text-[11px] uppercase text-primary dark:text-foreground leading-tight">{product.name}</h3>
                    {product.onOffer && <span className="text-[7px] font-black uppercase text-secondary">On Offer</span>}
                  </div>
                  <div className="text-right">
                    {product.onOffer && <p className="text-[8px] text-muted-foreground line-through">KES {product.price.toLocaleString()}</p>}
                    <p className="font-black text-xs text-secondary leading-none">KES {(product.onOffer ? product.offerPrice : product.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => handleNewsletterGenerate(product)} className="h-7 text-[8px] font-black uppercase px-2 text-blue-500"><Mail className="h-3 w-3 mr-1" /> Newsletter</Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="h-7 text-[8px] font-black uppercase px-2">Edit</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[8px] font-black uppercase px-2 text-destructive" onClick={() => { if(confirm("Delete?")) deleteDoc(doc(db, "products", product.id)); }}>Del</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Showing {Math.min(filteredProducts.length, ITEMS_PER_PAGE * (currentPage - 1) + 1)} - {Math.min(filteredProducts.length, ITEMS_PER_PAGE * currentPage)} of {filteredProducts.length}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-4 bg-muted/20 rounded-lg border-2">
              <span className="text-[10px] font-black uppercase">{currentPage}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/</span>
              <span className="text-[10px] font-black text-muted-foreground">{totalPages}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">{editingProduct ? "Update Product" : "New Release"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-background" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="bg-background" /></div>
                  <div className="space-y-2"><Label>Regular Price (KES)</Label><Input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-background" /></div>
                </div>

                <div className="p-4 bg-secondary/5 border-2 border-secondary/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-black uppercase">Promotional Offer</Label>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Flag this pair for a special price</p>
                    </div>
                    <Switch 
                      checked={form.onOffer} 
                      onCheckedChange={(checked) => setForm({...form, onOffer: checked})} 
                    />
                  </div>
                  {form.onOffer && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label>Offer Price (KES)</Label>
                      <Input type="number" required={form.onOffer} value={form.offerPrice} onChange={e => setForm({...form, offerPrice: e.target.value})} className="border-secondary/50 focus:ring-secondary bg-background" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sneakers">Sneakers</SelectItem>
                        <SelectItem value="Boots">Boots</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Official">Official</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Select value={form.stockStatus} onValueChange={v => setForm({...form, stockStatus: v})}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Few Left">Few Left</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Description</Label><Button type="button" variant="ghost" size="sm" onClick={handleAiGenerate} disabled={isAiGenerating} className="text-secondary font-black uppercase text-[9px] gap-1">{isAiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Copy</Button></div>
                  <Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-background" />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Sizes (EU)</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                  {SHOE_SIZES.map(size => (
                    <div key={size} className="flex items-center space-x-2 bg-background px-2 py-1 rounded border">
                      <Checkbox id={`s-${size}`} checked={form.availableSizes.includes(size)} onCheckedChange={() => toggleSize(size)} />
                      <Label htmlFor={`s-${size}`} className="text-[10px] font-bold">{size}</Label>
                    </div>
                  ))}
                </div>
                <Label>Image</Label>
                <MediaLibrary selectedUrl={form.imageUrl} onSelect={url => setForm({...form, imageUrl: url})} />
                {form.imageUrl && (
                  <div className="h-32 w-full rounded-xl overflow-hidden border-2 border-secondary/20 mt-2 relative">
                    <img src={form.imageUrl} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none text-2xl font-black uppercase -rotate-45">K254</div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!form.imageUrl} className="w-full bg-primary font-black uppercase tracking-widest h-12">
                {editingProduct ? "Save Changes" : "Publish Kicks"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Newsletter Generation Dialog */}
      <Dialog open={newsletterOpen} onOpenChange={setNewsletterOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Email Campaign Draft</DialogTitle>
            <DialogDescription className="font-bold uppercase text-[10px]">Generate a luxury newsletter for {activeProductForNewsletter?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {isGeneratingNewsletter ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Crafting premium HTML...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-xl border max-h-[400px] overflow-y-auto">
                   <code className="text-[10px] font-mono whitespace-pre-wrap">{newsletterHtml}</code>
                </div>
                <div className="flex gap-2">
                   <Button onClick={copyNewsletterHtml} className="flex-1 font-black uppercase tracking-widest h-12 bg-secondary text-primary">
                     <Copy className="mr-2 h-5 w-5" /> Copy HTML Code
                   </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
