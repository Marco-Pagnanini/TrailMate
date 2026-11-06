"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";
import styles from "../admin.module.css";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className={styles.loginCard}>
      <div className={styles.brand}><span className={styles.led} />TRAILMATE</div>
      <h1 className={styles.h1}>Admin</h1>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8e969e" }}>Password</span>
        <input name="password" type="password" required autoFocus autoComplete="current-password" className={`field${state.error ? " bad" : ""}`} />
      </label>
      {state.error && <p role="alert" className={styles.error}>{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Checking…" : "Sign in"}</button>
    </form>
  );
}
