
"use client";

import React, { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  User as UserIcon,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminCustomers() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const customersQuery = useMemoFirebase(() => query(collection(db, "userProfiles"), orderBy("email", "asc")), [db]);
  const { data: customers, isLoading } = useCollection(customersQuery);

  const filteredCustomers = customers?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Customer Management</h1>
        <p className="text-muted-foreground font-medium">View and manage registered shoppers.</p>
      </div>

      <div className="bg-white rounded-xl border-2 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-10 border-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" /></TableCell></TableRow>
            ) : filteredCustomers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.email}`} />
                      <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm">{customer.name || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant={customer.role === "admin" ? "default" : "secondary"} className="text-[9px] uppercase font-black px-2">
                     {customer.role === "admin" ? <Shield className="h-2 w-2 mr-1" /> : null}
                     {customer.role}
                   </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {customer.createdAt?.seconds ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filteredCustomers?.length && !isLoading && (
              <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">No customers found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
