
"use client";

import React, { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/admin/media-library";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminCategories() {
  const db = useFirestore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
  });

  const categoriesQuery = useMemoFirebase(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories, isLoading } = useCollection(categoriesQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const data = {
        name: form.name,
        imageUrl: form.imageUrl,
        slug,
      };

      if (editingCat) {
        await updateDoc(doc(db, "categories", editingCat.id), data);
        toast({ title: "Category Updated" });
      } else {
        await addDoc(collection(db, "categories"), data);
        toast({ title: "Category Added" });
      }
      setDialogOpen(false);
      setForm({ name: "", imageUrl: "" });
    } catch (error: any) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const seedDefaults = async () => {
    setIsSeeding(true);
    try {
      const defaults = [
        { name: "Sneakers", slug: "sneakers", imageUrl: "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?q=80&w=1000" },
        { name: "Boots", slug: "boots", imageUrl: "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?q=80&w=1000" },
        { name: "Casual", slug: "casual", imageUrl: "https://images.unsplash.com/photo-1594470086007-3b6962502bae?q=80&w=1000" },
        { name: "Official", slug: "official", imageUrl: "https://images.unsplash.com/photo-1657036779347-db31ebaad251?q=80&w=1000" },
      ];

      for (const cat of defaults) {
        // Check if category already exists to avoid duplicates
        const exists = categories?.find(c => c.slug === cat.slug);
        if (!exists) {
          await addDoc(collection(db, "categories"), cat);
        }
      }
      toast({ title: "Quick Setup Complete", description: "Default shoe categories have been added." });
    } catch (e: any) {
      toast({ title: "Setup Failed", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Category Manager</h1>
          <p className="text-muted-foreground font-medium">Organize your shoe collections for the public store.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDefaults} disabled={isSeeding} className="h-12 px-6 font-bold border-2 border-primary/20 hover:border-primary">
            {isSeeding ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-secondary" />}
            Quick Setup Defaults
          </Button>
          <Button onClick={() => { setEditingCat(null); setForm({name: "", imageUrl: ""}); setDialogOpen(true); }} className="h-12 px-8 font-black uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Plus className="mr-2 h-5 w-5" /> New Category
          </Button>
        </div>
      </div>

      {(!categories || categories.length === 0) && !isLoading && (
        <Alert className="bg-secondary/5 border-2 border-secondary/20">
          <Sparkles className="h-4 w-4 text-secondary" />
          <AlertTitle className="font-black uppercase text-xs">Getting Started?</AlertTitle>
          <AlertDescription className="text-sm font-medium">
            Your category list is empty. Click "Quick Setup Defaults" to automatically add Sneakers, Boots, Casual, and Official categories.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-secondary" /></div>
        ) : categories?.map((cat) => (
          <div key={cat.id} className="bg-white border-2 rounded-xl overflow-hidden group hover:border-secondary transition-all shadow-sm">
            <div className="aspect-video relative bg-muted">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} className="w-full h-full object-cover" alt={cat.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <Button variant="secondary" size="sm" className="font-bold" onClick={() => { setEditingCat(cat); setForm({name: cat.name, imageUrl: cat.imageUrl}); setDialogOpen(true); }}>Edit</Button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-black uppercase text-sm block">{cat.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">/{cat.slug}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm("Delete this category? Products in this category will remain but won't be filtered.")) deleteDoc(doc(db, "categories", cat.id)); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-xl font-black uppercase">{editingCat ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Luxury Sneakers" />
            </div>
            <div className="space-y-4">
              <Label>Cover Image</Label>
              <MediaLibrary selectedUrl={form.imageUrl} onSelect={url => setForm({...form, imageUrl: url})} />
            </div>
            <DialogFooter>
               <Button type="submit" className="w-full font-black uppercase h-12" disabled={!form.imageUrl}>Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
