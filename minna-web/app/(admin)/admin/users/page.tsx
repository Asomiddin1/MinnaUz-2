"use client";

import { useEffect, useState, useCallback } from "react";
import { adminAPI } from "@/lib/api/admin";
import { useSession } from "next-auth/react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Search, Crown, RefreshCcw } from "lucide-react";
import { toast } from "sonner"; 

// =====================
// TYPE
// =====================
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  coins: number;
  streak: number;
  avatar?: string;
  is_premium: boolean;
};

const UsersPage = () => {
  const { status } = useSession(); // Login holatini tekshirish
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    coins: 0,
    is_premium: false,
  });

  // =====================
  // FETCH USERS (Laravel Paginate moslashgan)
  // =====================
  const fetchUsers = useCallback(async (search = "") => {
  try {
    setLoading(true);
    const response = await adminAPI.getAllUsers(1, search);
    
    // 🚩 BU YERDA KONSOLNI KO'RING
    console.log("Response Data:", response.data);

    // Agar ma'lumot response.data.data ichida bo'lsa (Laravel pagination)
    if (response.data && response.data.data) {
       console.log("Pagination massivi topildi:", response.data.data);
       setUsers(response.data.data);
    } 
    // Agar ma'lumot to'g'ridan-to'g'ri massiv bo'lib kelsa
    else if (Array.isArray(response.data)) {
       console.log("Oddiy massiv topildi:", response.data);
       setUsers(response.data);
    } 
    else {
       console.log("Ma'lumot massiv emas!");
       setUsers([]);
    }
  } catch (error) {
    console.error("API xatosi:", error);
  } finally {
    setLoading(false);
  }
}, []);
  // Faqat sessiya tayyor bo'lganda va qidiruv o'zgarganda ishlaydi
  useEffect(() => {
    if (status === "authenticated") {
      const delay = setTimeout(() => {
        fetchUsers(searchQuery);
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [searchQuery, status, fetchUsers]);

  // =====================
  // TOGGLE PREMIUM (API orqali)
  // =====================
  const handleTogglePremium = async (userId: number) => {
    try {
      const res = await adminAPI.togglePremium(userId);
      toast.success(res.data.message);
      
      // Local state-ni yangilash (modal ichida bo'lsa)
      setFormData(prev => ({ ...prev, is_premium: !prev.is_premium }));
      
      // Ro'yxatni yangilash
      fetchUsers(searchQuery);
    } catch (error) {
      toast.error("Statusni o'zgartirib bo'lmadi");
    }
  };

  // =====================
  // EDIT & UPDATE
  // =====================
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      coins: user.coins,
      is_premium: user.is_premium,
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await adminAPI.updateUser(editingUser.id, formData);
      toast.success("Foydalanuvchi yangilandi");
      setEditingUser(null);
      fetchUsers(searchQuery);
    } catch {
      toast.error("Yangilashda xatolik yuz berdi");
    }
  };

  // =====================
  // SKELETON
  // =====================
  const renderSkeletons = () => (
    <div className="border rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <Table>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} className="border-b">
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
          <p className="text-muted-foreground text-sm">Platformadagi barcha foydalanuvchilarni boshqarish.</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchUsers(searchQuery)}>
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Ism yoki email orqali qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABLE */}
      {loading ? renderSkeletons() : (
        <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Koinlar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-slate-500">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          {user.name}
                          {user.is_premium && <Crown className="h-3 w-3 text-yellow-500" />}
                        </span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>🪙 {user.coins}</TableCell>
                  <TableCell>
                    {user.is_premium ? (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 border-none">PREMIUM</Badge>
                    ) : (
                      <Badge variant="outline">FREE</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleEditClick(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    Foydalanuvchilar topilmadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* EDIT MODAL */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Tahrirlash</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">F.I.SH</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Koinlar yig'indisi</label>
              <Input 
                type="number"
                value={formData.coins} 
                onChange={(e) => setFormData({ ...formData, coins: Number(e.target.value) })} 
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Premium Status</span>
                <span className="text-xs text-muted-foreground">Foydalanuvchi obunasi</span>
              </div>
              <Button
                size="sm"
                variant={formData.is_premium ? "default" : "outline"}
                onClick={() => editingUser && handleTogglePremium(editingUser.id)}
                className={formData.is_premium ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
              >
                <Crown className="h-4 w-4 mr-2" />
                {formData.is_premium ? "Faol" : "Yoqish"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Bekor qilish</Button>
            <Button onClick={handleUpdate}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;