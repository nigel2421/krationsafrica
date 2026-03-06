"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useFirestore, useStorage } from "@/firebase";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Loader2, 
  Plus, 
  Search,
  ExternalLink,
  CheckCircle2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  createdAt: any;
}

export default function AdminMedia() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMedia = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items: MediaItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      setImages(items);
    } catch (e: any) {
      console.error("Error fetching media", e);
      toast({ title: "Sync Failed", description: "Could not load media library.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [db]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !db) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `products/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "media"), {
        url,
        name: file.name,
        storagePath: `products/${fileName}`,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Upload Success", description: "Asset added to library." });
      fetchMedia();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Permanently delete this asset? This cannot be undone.")) return;
    
    try {
      // 1. Try to delete from storage if path exists
      if (item.storagePath) {
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef);
      } else {
        // Fallback for older items that might not have storagePath recorded
        // We try to extract it from the URL if possible, or just delete the DB record
        console.warn("No storage path found for item, deleting DB record only.");
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, "media", item.id));
      
      toast({ title: "Asset Deleted", description: "The image has been removed from cloud storage." });
      setImages(images.filter(img => img.id !== item.id));
    } catch (e: any) {
      console.error(e);
      toast({ title: "Partial Deletion", description: "Record removed, but file might persist in storage.", variant: "destructive" });
      // Still remove from UI
      await deleteDoc(doc(db, "media", item.id)).catch(() => {});
      setImages(images.filter(img => img.id !== item.id));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL Copied", description: "Link ready to use." });
  };

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Media Library</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">Manage your cloud assets & brand visuals</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter assets..." 
              className="pl-10 h-11 border-2 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Label htmlFor="media-upload" className="cursor-pointer shrink-0">
            <Input 
              id="media-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button asChild disabled={uploading} className="h-11 px-6 font-black uppercase tracking-widest bg-secondary text-primary">
              <span>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploading ? "Uploading..." : "Add Asset"}
              </span>
            </Button>
          </Label>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing cloud gallery...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <Card className="border-2 border-dashed bg-muted/10 py-32 text-center">
          <CardContent className="space-y-4">
            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black uppercase">No Media Found</h3>
            <p className="text-muted-foreground text-sm font-medium">Upload brand visuals or product shots to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredImages.map((img) => (
            <div key={img.id} className="group relative bg-card border-2 rounded-xl overflow-hidden hover:border-secondary transition-all shadow-sm">
              <div className="aspect-square relative bg-muted overflow-hidden">
                <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                   <Button size="sm" variant="secondary" className="w-full font-bold text-[10px] uppercase h-8" onClick={() => copyUrl(img.url)}>
                     <Copy className="h-3 w-3 mr-1" /> Copy Link
                   </Button>
                   <Button size="sm" variant="destructive" className="w-full font-bold text-[10px] uppercase h-8" onClick={() => handleDelete(img)}>
                     <Trash2 className="h-3 w-3 mr-1" /> Delete
                   </Button>
                </div>
              </div>
              <div className="p-3 bg-card border-t">
                <p className="text-[10px] font-black uppercase truncate text-foreground mb-1">{img.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">{img.createdAt?.seconds ? new Date(img.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}</span>
                  <a href={img.url} target="_blank" className="text-secondary hover:text-primary"><ExternalLink className="h-3 w-3" /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
