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
  device_limit: number;
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
  // SKELETON
  // =====================
  const renderSkeletons = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">
          Users Admin Panel
        </h1>

        <Badge variant="outline">
          Jami: {users.length}
        </Badge>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABLE */}
      {loading ? (
        renderSkeletons()
      ) : (
        <div className="border rounded-lg bg-white">

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>

                  {/* USER */}
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.name}

                        {user.is_premium && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>

                  {/* ROLE */}
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* COINS */}
                  <TableCell>
                    🪙 {user.coins}
                  </TableCell>

                  {/* STREAK */}
                  <TableCell>
                    🔥 {user.streak}
                  </TableCell>

                  {/* DEVICE */}
                  <TableCell>
                    📱 {user.device_limit}
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    {user.is_premium ? (
                      <Badge className="bg-yellow-500">
                        PREMIUM
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        FREE
                      </Badge>
                    )}
                  </TableCell>

                  {/* ACTION */}
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(user)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">

            {/* NAME */}
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Name"
            />

            {/* COINS */}
            <Input
              type="number"
              value={formData.coins}
              onChange={(e) =>
                setFormData({ ...formData, coins: Number(e.target.value) })
              }
              placeholder="Coins"
            />

            {/* 💎 PREMIUM TOGGLE */}
            <div className="flex items-center justify-between border p-2 rounded">
              <span>Premium</span>

              <Button
                size="sm"
                variant={formData.is_premium ? "default" : "outline"}
                onClick={() =>
                  setFormData({
                    ...formData,
                    is_premium: !formData.is_premium,
                  })
                }
              >
                <Crown className="h-4 w-4 mr-1" />
                {formData.is_premium ? "ON" : "OFF"}
              </Button>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>

            <Button onClick={handleUpdate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default UsersPage;