import { useEffect, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { getInvitations, sendInvitation } from "../../api/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function InvitationsTab({ courseId }) {
  const [invitations, setInvitations] = useState([]);
  const [invEmail, setInvEmail] = useState("");
  const [invSending, setInvSending] = useState(false);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await getInvitations(courseId);
      setInvitations(res.data.data || res.data || []);
    } catch {}
  }, [courseId]);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const handleSendInvite = async () => {
    if (!invEmail.trim()) return;
    setInvSending(true);
    try {
      await sendInvitation(courseId, invEmail);
      toast.success("Invitation sent");
      setInvEmail("");
      fetchInvitations();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setInvSending(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Invitations</h2>
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Email address"
          type="email"
          value={invEmail}
          onChange={(e) => setInvEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
        />
        <Button onClick={handleSendInvite} disabled={invSending}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {invSending ? "Sending..." : "Send Invite"}
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No invitations sent yet
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    {inv.acceptedAt ? (
                      <Badge variant="default">Accepted {new Date(inv.acceptedAt).toLocaleDateString()}</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
