"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useFirestore, useStorage } from "@/firebase";
import { Upload, Check, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  createdAt: any;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export function MediaLibrary({ onSelect, selectedUrl }: MediaLibraryProps) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const fetchMedia = async () => {
    if (!db) return;
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
      if (e.code === 'permission-denied') {
        toast({ title: "Access Denied", description: "You don't have permission to view media.", variant: "destructive" });
      }
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
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "media"), {
        url,
        name: file.name,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Upload Success", description: "Image added to library." });
      fetchMedia();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 border rounded-xl p-4 bg-muted/10">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-secondary" />
          Media Library
        </h3>
        <Label htmlFor="image-upload" className="cursor-pointer">
          <Input 
            id="image-upload" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button variant="outline" size="sm" asChild>
            <span>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload New"}
            </span>
          </Button>
        </Label>
      </div>

      <ScrollArea className="h-[300px] w-full border rounded-md p-2 bg-background">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8">
            <p>No images in library yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelect(img.url)}
                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                  selectedUrl === img.url ? "border-secondary ring-2 ring-secondary/20" : "border-transparent hover:border-muted-foreground"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 150px"
                  className="object-cover"
                />
                {selectedUrl === img.url && (
                  <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}