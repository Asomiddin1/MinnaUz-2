"use client";

import { useEffect, useState } from "react";
import { userAPI } from "@/lib/api";

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
import { Edit, Search, Crown } from "lucide-react";

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
  // FETCH USERS
  // =====================
  const fetchUsers = async (search = "") => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers(1, search);
      setUsers(response.data.data || response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // =====================
  // EDIT CLICK
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

  // =====================
  // UPDATE USER
  // =====================
  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      await userAPI.updateUser(editingUser.id, formData);
      setEditingUser(null);
      fetchUsers(searchQuery);
    } catch {
      alert("Xatolik yuz berdi!");
    }
  };

  // =====================
  // BEAUTIFUL SKELETON
  // =====================
  const renderSkeletons = () => (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-x-auto shadow-sm w-full">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="border-b-slate-200 dark:border-b-slate-800">
            <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Id</TableHead>
            <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">User</TableHead>
            <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Role</TableHead>
            <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Coins</TableHead>
            <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Streak</TableHead>
            <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Status</TableHead>
            <TableHead className="whitespace-nowrap text-right text-slate-500 dark:text-slate-400">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} className="border-b-slate-200 dark:border-b-slate-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-slate-800" /></TableCell>
              <TableCell className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[120px] dark:bg-slate-800" />
                  <Skeleton className="h-3 w-[160px] dark:bg-slate-800" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full dark:bg-slate-800" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12 dark:bg-slate-800" /></TableCell>
              <TableCell><Skeleton className="h-4 w-10 dark:bg-slate-800" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 rounded-full dark:bg-slate-800" /></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md dark:bg-slate-800" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
         Foydalanuvhilarni boshqaring
        </h1>

        <Badge variant="outline" className="w-fit whitespace-nowrap border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Jami: {users.length}
        </Badge>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 w-full sm:max-w-md flex items-center">
        <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <Input
          className="pl-10 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABLE SECTION */}
      {loading ? (
        renderSkeletons()
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-x-auto shadow-sm w-full">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="border-b-slate-200 dark:border-b-slate-800 hover:bg-transparent">
                <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Id</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">User</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Role</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Coins</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Streak</TableHead>
                <TableHead className="whitespace-nowrap text-slate-500 dark:text-slate-400">Status</TableHead>
                <TableHead className="whitespace-nowrap text-right text-slate-500 dark:text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-b-slate-200 dark:border-b-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* ID */}
                  <TableCell className="font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    #{user.id}
                  </TableCell>

                  {/* USER */}
                  <TableCell className="flex items-center gap-3 min-w-[200px]">
                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col overflow-hidden">
                      <div className="font-medium flex items-center gap-2 truncate text-slate-900 dark:text-slate-200">
                        {user.name}
                        {user.is_premium && (
                          <Crown className="h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>

                  {/* ROLE */}
                  <TableCell className="whitespace-nowrap">
                    <Badge 
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={user.role !== "admin" ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700" : ""}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* COINS */}
                  <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">
                    🪙 {user.coins}
                  </TableCell>

                  {/* STREAK */}
                  <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">
                    🔥 {user.streak}
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className="whitespace-nowrap">
                    {user.is_premium ? (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                        PREMIUM
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                        FREE
                      </Badge>
                    )}
                  </TableCell>

                  {/* ACTION */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(user)}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* MODAL */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] mx-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Edit User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">

            {/* NAME */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="User name"
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* COINS */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Coins</label>
              <Input
                type="number"
                value={formData.coins}
                onChange={(e) =>
                  setFormData({ ...formData, coins: Number(e.target.value) })
                }
                placeholder="0"
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* 💎 PREMIUM TOGGLE */}
            <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 mt-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Premium Status</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Enable premium features</span>
              </div>

              <Button
                size="sm"
                variant={formData.is_premium ? "default" : "outline"}
                onClick={() =>
                  setFormData({
                    ...formData,
                    is_premium: !formData.is_premium,
                  })
                }
                className={
                  formData.is_premium 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white border-none" 
                    : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }
              >
                <Crown className="h-4 w-4 mr-1.5" />
                {formData.is_premium ? "Active" : "Inactive"}
              </Button>
            </div>

          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button 
              className="w-full sm:w-auto border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" 
              variant="outline" 
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </Button>

            <Button className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200" onClick={handleUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default UsersPage;