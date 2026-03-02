
"use client";

import React, { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/admin/media-library";

export default function AdminCategories() {
  const db = useFirestore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Category Manager</h1>
          <p className="text-muted-foreground font-medium">Organize your shoe collections.</p>
        </div>
        <Button onClick={() => { setEditingCat(null); setForm({name: "", imageUrl: ""}); setDialogOpen(true); }} className="h-12 px-8 font-black uppercase bg-secondary text-secondary-foreground">
          <Plus className="mr-2 h-5 w-5" /> New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-secondary" /></div>
        ) : categories?.map((cat) => (
          <div key={cat.id} className="bg-white border-2 rounded-xl overflow-hidden group hover:border-secondary transition-all">
            <div className="aspect-video relative bg-muted">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} className="w-full h-full object-cover" alt={cat.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="font-black uppercase text-sm">{cat.name}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditingCat(cat); setForm({name: cat.name, imageUrl: cat.imageUrl}); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if(confirm("Delete?")) deleteDoc(doc(db, "categories", cat.id)); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
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
               <Button type="submit" className="w-full font-black uppercase h-12">Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
