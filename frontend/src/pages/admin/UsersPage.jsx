import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Plus, Pencil, UserX, Copy, Check } from "lucide-react";
import { listUsers, createUser, updateUser, deleteUser } from "../../api/admin";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", role: "INSTRUCTOR", password: "" });
  const [creating, setCreating] = useState(false);

  const [tempPassword, setTempPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", role: "", isActive: true });
  const [updating, setUpdating] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== "ALL") params.role = roleFilter;
      const res = await listUsers(params);
      setUsers(res.data.data || res.data.users || res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.firstName.trim() || !createForm.email.trim()) {
      toast.error("First name and email are required");
      return;
    }
    setCreating(true);
    try {
      const payload = { ...createForm };
      if (!payload.password) delete payload.password;
      const res = await createUser(payload);
      const userData = res.data.data || res.data;
      toast.success("User created");
      setCreateOpen(false);
      setCreateForm({ firstName: "", lastName: "", email: "", role: "INSTRUCTOR", password: "" });
      if (userData.temporaryPassword) {
        setTempPassword(userData.temporaryPassword);
        setCopied(false);
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u) => {
    if (u.id === currentUser?.id) {
      toast.error("You cannot edit your own account from here");
      return;
    }
    setEditingUser(u);
    setEditForm({ firstName: u.firstName || "", lastName: u.lastName || "", role: u.role, isActive: u.isActive !== false });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateUser(editingUser.id, editForm);
      toast.success("User updated");
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 403) toast.error("You cannot modify your own role");
      else toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateTarget?.id === currentUser?.id) {
      toast.error("You cannot deactivate yourself");
      setDeactivateTarget(null);
      return;
    }
    setDeactivating(true);
    try {
      await deleteUser(deactivateTarget.id);
      toast.success("User deactivated");
      setDeactivateTarget(null);
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 403) toast.error("You cannot deactivate yourself");
      else toast.error(err.response?.data?.message || "Failed to deactivate");
    } finally {
      setDeactivating(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage platform users and roles</p>
        </div>
        <Button onClick={() => { setCreateForm({ firstName: "", lastName: "", email: "", role: "INSTRUCTOR", password: "" }); setCreateOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" /> Create User
        </Button>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
            <SelectItem value="LEARNER">Learner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive !== false ? "outline" : "destructive"}>
                      {u.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(u)}
                        disabled={u.id === currentUser?.id}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeactivateTarget(u)}
                        disabled={u.id === currentUser?.id}
                        title="Deactivate"
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new admin or instructor to the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">First Name *</label>
                <Input value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Leave blank to auto-generate" />
              <p className="text-xs text-muted-foreground">If left blank, a temporary password will be generated.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Temporary Password Dialog */}
      <Dialog open={!!tempPassword} onOpenChange={(o) => !o && setTempPassword(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
            <DialogDescription>Share this password with the user. It will not be shown again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
            <span className="flex-1 select-all">{tempPassword}</span>
            <Button variant="ghost" size="icon-sm" onClick={copyPassword}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setTempPassword(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update {editingUser?.firstName}'s role and status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">First Name</label>
                <Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select value={editForm.isActive ? "active" : "inactive"} onValueChange={(v) => setEditForm({ ...editForm, isActive: v === "active" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updating}>{updating ? "Updating..." : "Update"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {deactivateTarget?.firstName} {deactivateTarget?.lastName}? They will no longer be able to log in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivating}>
              {deactivating ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
