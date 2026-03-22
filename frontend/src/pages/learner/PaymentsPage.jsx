import { useEffect, useState } from "react";
import { getMyPayments } from "../../api/payments";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { CreditCard, Receipt } from "lucide-react";

const statusColors = {
  COMPLETED: "default",
  SUCCESS: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayments()
      .then((res) => setPayments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="rounded-lg border border-border">
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-border p-4 last:border-0">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Payment History
        </h1>
        <p className="mt-1 text-muted-foreground">
          View your transaction history
        </p>
      </div>

      {payments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Table Header */}
          <div className="hidden border-b border-border bg-muted/50 px-4 py-3 sm:grid sm:grid-cols-6 sm:gap-4">
            <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="grid grid-cols-1 gap-2 px-4 py-4 text-sm sm:grid-cols-6 sm:items-center sm:gap-4"
              >
                <div className="col-span-2">
                  <p className="font-medium text-foreground">
                    {payment.course?.title || payment.courseName || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-foreground">
                  <span className="font-medium">
                    {payment.amount != null
                      ? `${payment.currency || "USD"} ${Number(payment.amount).toFixed(2)}`
                      : "—"}
                  </span>
                </div>
                <div>
                  <Badge
                    variant={
                      statusColors[payment.status?.toUpperCase()] || "secondary"
                    }
                    className="text-xs"
                  >
                    {payment.status || "UNKNOWN"}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  {payment.provider || payment.paymentProvider || "—"}
                </div>
                <div className="hidden text-muted-foreground sm:block">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <Receipt size={48} className="text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-foreground">
            No payments yet
          </p>
          <p className="text-sm text-muted-foreground">
            Your payment history will appear here
          </p>
        </div>
      )}
    </div>
  );
}
