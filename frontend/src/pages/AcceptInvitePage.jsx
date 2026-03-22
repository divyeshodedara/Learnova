import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function acceptInvite() {
      try {
        const res = await api.post(`/invitations/accept/${token}`);
        if (!cancelled) {
          setStatus("success");
          setMessage(
            res.data?.message ||
              "Invitation accepted! You've been enrolled in the course."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "This invitation link is invalid or has expired.";
          setMessage(msg);
        }
      }
    }

    acceptInvite();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-foreground" />
            <p className="text-lg font-medium text-foreground">
              Processing your invitation…
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your invite link.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
              <CheckCircle2 className="h-8 w-8 text-background" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              You&apos;re In!
            </h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="mt-4 flex gap-3">
              <Button asChild variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Invitation Failed
            </h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="mt-4 flex gap-3">
              <Button asChild variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
