import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  UserX,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { listUsers, createUser, updateUser, deleteUser } from "../../api/admin";
import { useAuth } from "../../hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "INSTRUCTOR", password: "" });
  const [saving, setSaving] = useState(false);

  const [tempPassword, setTempPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== "ALL") params.role = roleFilter;
      const res = await listUsers(params);
      setUsers(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm({ firstName: "", lastName: "", email: "", role: "INSTRUCTOR", password: "" });
    setDialogOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      role: u.role || "INSTRUCTOR",
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing && (!form.firstName.trim() || !form.email.trim())) {
      toast.error("First name and email are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload = {};
        if (form.firstName !== editing.firstName) payload.firstName = form.firstName;
        if (form.lastName !== editing.lastName) payload.lastName = form.lastName;
        if (form.role !== editing.role) payload.role = form.role;
        await updateUser(editing.id, payload);
        toast.success("User updated");
        setDialogOpen(false);
      } else {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        const res = await createUser(payload);
        const data = res.data.data || res.data;
        setDialogOpen(false);
        if (data.temporaryPassword) {
          setTempPassword(data.temporaryPassword);
          setCopied(false);
        }
        toast.success("User created");
      }
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Save failed";
      if (err.response?.status === 403) toast.error("Permission denied: " + msg);
      else toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deleteUser(deactivateTarget.id);
      toast.success("User deactivated");
      setDeactivateTarget(null);
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 403) toast.error("You cannot deactivate yourself");
      else toast.error(err.response?.data?.message || "Failed");
      setDeactivateTarget(null);
    }
  };

  const toggleActive = async (u) => {
    try {
      await updateUser(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? "User deactivated" : "User reactivated");
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 403) toast.error("You cannot change your own status");
      else toast.error(err.response?.data?.message || "Failed");
    }
  };

  const isSelf = (u) => u.id === currentUser?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">Manage platform users and roles</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Create User
        </Button>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
            <SelectItem value="LEARNER">Learner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive !== false ? "outline" : "destructive"}>
                      {u.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(u)} disabled={isSelf(u)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => isSelf(u) ? toast.error("You cannot deactivate yourself") : setDeactivateTarget(u)}
                          disabled={isSelf(u)}
                        >
                          <UserX className="mr-2 h-3.5 w-3.5" /> Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update user details." : "Add a new admin or instructor."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Password (optional)</Label>
                <Input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" />
                <p className="text-xs text-muted-foreground">Leave empty to auto-generate a temporary password.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
            <DialogDescription>Share this password with the new user. It won't be shown again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">{tempPassword}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setTempPassword(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {deactivateTarget?.firstName} {deactivateTarget?.lastName}? They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
