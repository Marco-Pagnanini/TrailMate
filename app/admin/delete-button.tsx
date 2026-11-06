"use client";

import { removeSignup } from "./actions";
import styles from "./admin.module.css";

export default function DeleteButton({ id, email }: { id: string; email: string }) {
  return (
    <form
      action={removeSignup}
      onSubmit={(e) => { if (!confirm(`Remove ${email} from the waiting list?`)) e.preventDefault(); }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.del} aria-label={`Remove ${email}`}>Remove</button>
    </form>
  );
}
