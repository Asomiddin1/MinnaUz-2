"use client";

import { useEffect, useState } from 'react';
import { userAPI } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // <-- Skeleton import qilindi
import { Edit, Search } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', role: '', coins: 0 });

  const fetchUsers = async (search = "") => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers(1, search);
      setUsers(response.data.data || response.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setFormData({ name: user.name, role: user.role, coins: user.coins });
  };

  const handleUpdate = async () => {
    try {
      await userAPI.updateUser(editingUser.id, formData);
      setEditingUser(null);
      fetchUsers(searchQuery);
    } catch (err) { 
      alert("Xatolik yuz berdi!"); 
    }
  };

  // SKELETON LOADER KOMPONENTI (Qayta-qayta yozmaslik uchun alohida o'zgaruvchiga oldik)
  const renderSkeletons = () => (
    <>
      {/* DESKTOP SKELETON (Jadval) */}
      <div className="hidden md:block border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Tangalar</TableHead>
              <TableHead className="text-right">Streak</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 5 ta soxta qator yaratamiz */}
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MOBIL SKELETON (Kartalar) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="w-full flex flex-col items-center">
                <Skeleton className="h-3 w-12 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="w-[1px] h-8 bg-gray-200 mx-4"></div>
              <div className="w-full flex flex-col items-center">
                <Skeleton className="h-3 w-12 mb-2" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Foydalanuvchilarni boshqarish</h1>
        <Badge variant="outline" className="text-sm md:text-lg py-1 px-3">
          Jami: {users.length}
        </Badge>
      </div>

      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input 
          type="text"
          placeholder="Ism yoki email bo'yicha qidiring..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* SHU YERDA SKELETON YOKI DATA KO'RSATILADI */}
      {loading && users.length === 0 ? (
        renderSkeletons()
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white border rounded-lg">
          Foydalanuvchi topilmadi.
        </div>
      ) : (
        <>
          {/* DESKTOP KO'RINISh */}
          <div className="hidden md:block border rounded-lg bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Foydalanuvchi</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Tangalar</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-500">#{user.id}</TableCell>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium "><span className=''>🪙</span>{user.coins || 0}</TableCell>
                    <TableCell className="text-right text-orange-500 font-bold">🔥 {user.streak || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="h-4 w-4 mr-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBIL KO'RINISh */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users.map((user: any) => (
              <div key={user.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">{user.name}</h3>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                    {user.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500 mb-1">Tangalar</p>
                    <p className="font-mono font-semibold">🪙{user.coins || 0}</p>
                  </div>
                  <div className="w-[1px] h-8 bg-gray-200"></div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500 mb-1">Streak</p>
                    <p className="font-bold text-orange-500">🔥 {user.streak || 0}</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-sm" onClick={() => handleEditClick(user)}>
                  <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAHRIRLASH MODALI */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px] w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>Foydalanuvchini tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ism</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tangalar (Coins)</label>
              <Input 
                type="number" 
                value={formData.coins} 
                onChange={(e) => setFormData({...formData, coins: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditingUser(null)}>
              Bekor qilish
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleUpdate}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;