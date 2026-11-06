import type { Metadata } from "next";
import LoginForm from "./login-form";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Admin — Trailmate", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className={styles.loginWrap}>
      <LoginForm />
    </main>
  );
}
