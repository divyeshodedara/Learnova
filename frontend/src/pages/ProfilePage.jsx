import { useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../api/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Camera, Trash2, Loader2, User } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE = 2 * 1024 * 1024;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, refetch } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [avatarBase64, setAvatarBase64] = useState(undefined);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const fileRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const b64 = await fileToBase64(file);
    setAvatarPreview(b64);
    setAvatarBase64(b64);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarBase64(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { firstName: firstName.trim(), lastName: lastName.trim() };
      if (avatarBase64 !== undefined) {
        payload.avatarUrl = avatarBase64;
      }
      await updateProfile(payload);
      await refetch();
      toast.success("Profile updated");
      setAvatarBase64(undefined);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Fill in both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPw(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted">
                <User size={32} className="text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="space-y-1">
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary">{user?.role}</Badge>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {avatarPreview && (
          <Button variant="outline" size="sm" onClick={removeAvatar}>
            <Trash2 size={14} className="mr-1" /> Remove Avatar
          </Button>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving}>
          {saving && <Loader2 size={14} className="mr-1 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={changingPw}
          >
            {changingPw && <Loader2 size={14} className="mr-1 animate-spin" />}
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
