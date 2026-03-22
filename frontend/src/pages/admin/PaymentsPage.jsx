import { useEffect, useState } from "react";
import { getAllPayments } from "../../api/payments";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { CreditCard, Receipt, Filter } from "lucide-react";

const statusColors = {
  SUCCESS: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPayments = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    getAllPayments(params)
      .then((res) => setPayments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="rounded-lg border border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border p-4 last:border-0">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const successCount = payments.filter((p) => p.status === "SUCCESS").length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          All Payments
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage and view payment transactions across all users
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Successful</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{successCount}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Filter size={16} className="text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {payments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden border-b border-border bg-muted/50 px-4 py-3 sm:grid sm:grid-cols-7 sm:gap-4">
            <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              User
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Course
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Provider
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </span>
          </div>

          <div className="divide-y divide-border">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="grid grid-cols-1 gap-2 px-4 py-4 text-sm sm:grid-cols-7 sm:items-center sm:gap-4"
              >
                <div className="col-span-2">
                  <p className="font-medium text-foreground">
                    {payment.user?.firstName} {payment.user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.user?.email}
                  </p>
                </div>
                <div className="text-foreground truncate">
                  {payment.course?.title || "—"}
                </div>
                <div className="text-foreground font-medium">
                  {payment.currency || "USD"} {Number(payment.amount).toFixed(2)}
                </div>
                <div>
                  <Badge
                    variant={statusColors[payment.status] || "secondary"}
                    className="text-xs"
                  >
                    {payment.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  {payment.provider || "—"}
                </div>
                <div className="text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <Receipt size={48} className="text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-foreground">
            No payments found
          </p>
          <p className="text-sm text-muted-foreground">
            {statusFilter ? "Try changing the filter" : "No transactions yet"}
          </p>
        </div>
      )}
    </div>
  );
}
