'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SearchBar({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const db = useFirestore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestionsQuery = useMemoFirebase(() => {
    if (!db || debouncedQuery.length < 2) return null;
    // Basic search: startWith filter (case sensitive in firestore usually, but we'll try to match common prefixes)
    // Note: Better search would use an external index, but for MVP we use where >= query
    const searchStr = debouncedQuery.charAt(0).toUpperCase() + debouncedQuery.slice(1);
    return query(
      collection(db, 'products'),
      where('name', '>=', searchStr),
      where('name', '<=', searchStr + '\uf8ff'),
      limit(5)
    );
  }, [db, debouncedQuery]);

  const { data: suggestions, isLoading } = useCollection(suggestionsQuery);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-sm", className)}>
      <form onSubmit={handleSearch} className="relative group">
        <Input
          type="text"
          placeholder="SEARCH KICKS..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="h-10 pl-10 pr-10 bg-muted/50 border-2 border-transparent focus-visible:border-secondary focus-visible:ring-0 rounded-none font-black uppercase text-[10px] tracking-widest placeholder:text-muted-foreground/50 transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (searchQuery.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b-2 border-muted flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Results</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-secondary" />}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!isLoading && suggestions?.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">No matches found</p>
              </div>
            )}
            {suggestions?.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-muted last:border-0 group"
              >
                <div className="relative h-12 w-12 bg-muted overflow-hidden">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-primary group-hover:text-secondary transition-colors line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-[10px] font-bold text-secondary">
                    KES {product.price.toLocaleString()}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
          {searchQuery && (
            <button
              onClick={() => handleSearch()}
              className="w-full p-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              See all results for "{searchQuery}" <ArrowRight className="h-4 w-4 text-secondary" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
