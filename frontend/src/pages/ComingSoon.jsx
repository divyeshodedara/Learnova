import { Construction } from "lucide-react";
import styles from "./dashboard.module.css";

export default function ComingSoon({ title, description }) {
  return (
    <div className={styles.comingSoon}>
      <Construction className="h-10 w-10" />
      <h2 className={styles.comingSoonTitle}>{title || "Coming Soon"}</h2>
      <p className={styles.comingSoonDesc}>
        {description || "This feature is under development"}
      </p>
    </div>
  );
}
