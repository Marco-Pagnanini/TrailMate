"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from "react";

type Point = { k: string; v: string };
type Part = { id: string; num: string; role: string; title: string; desc: string; points: Point[] };

const PARTS: Part[] = [
  { id: "battery", num: "01", role: "Endurance", title: "A battery that isn’t afraid of the cold",
    desc: "Lithium cells chosen to work below freezing, where ordinary batteries give out first.",
    points: [
      { k: "What it does", v: "Powers sensors, AI and radio for the whole hike." },
      { k: "Why it matters", v: "Cold is the first enemy of electronics at altitude." },
      { k: "In practice", v: "A dedicated reserve is always kept for SOS." } ] },
  { id: "brain", num: "02", role: "The brain", title: "An AI model that needs no network",
    desc: "The logic board with a dedicated NPU cross-checks every sensor and spots risk before it becomes an accident.",
    points: [
      { k: "What it does", v: "Analyses movement, weather and terrain right on the device." },
      { k: "Why it matters", v: "In the mountains there’s often no cloud: decisions happen here." },
      { k: "In practice", v: "Warns you if pace, altitude or weather change unusually." } ] },
  { id: "imu", num: "03", role: "Balance", title: "Feels every fall",
    desc: "Accelerometer and gyroscope track every step. If you fall and don’t get up, Trailmate knows.",
    points: [
      { k: "What it does", v: "Detects falls, slips and prolonged stillness." },
      { k: "Why it matters", v: "After a fall you may not be able to call for help." },
      { k: "In practice", v: "A countdown, then automatic SOS unless you cancel." } ] },
  { id: "climate", num: "04", role: "Weather", title: "Reads the sky before you do",
    desc: "Barometer and temperature sensor follow pressure and heat minute by minute. A sudden pressure drop signals a storm.",
    points: [
      { k: "What it does", v: "Measures pressure, barometric altitude and temperature." },
      { k: "Why it matters", v: "Storms at altitude build fast." },
      { k: "In practice", v: "Tells you when it’s time to head down." } ] },
  { id: "satellite", num: "05", role: "The lifeline", title: "SOS with no signal",
    desc: "A ceramic antenna links Trailmate to satellites for positioning and emergency messages, where your phone can’t connect.",
    points: [
      { k: "What it does", v: "GNSS positioning and SOS messaging via satellite." },
      { k: "Why it matters", v: "Many valleys have no mobile coverage." },
      { k: "In practice", v: "Rescuers receive your exact coordinates." } ] },
  { id: "camera", num: "06", role: "The eye", title: "Watches the trail with you",
    desc: "The wide-angle camera gives the AI model eyes: it recognises terrain, snow and ice, and records the scene when needed.",
    points: [
      { k: "What it does", v: "Recognises terrain type and trail conditions." },
      { k: "Why it matters", v: "Terrain changes faster than the map." },
      { k: "In practice", v: "In an accident, it attaches an image to the SOS." } ] },
  { id: "beacon", num: "07", role: "The voice", title: "Be found",
    desc: "A piezo siren and a strobe LED guide rescuers to you, day and night.",
    points: [
      { k: "What it does", v: "High-visibility sound and light signals." },
      { k: "Why it matters", v: "The last few metres of a rescue are the hardest." },
      { k: "In practice", v: "Activates on its own after SOS, or by holding the button." } ] },
];

const S = 0.16, E = 0.9, N = PARTS.length, LEN = (E - S) / N;
const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Phase = "intro" | "part" | "outro" | "none";
type Engine = HTMLElement & {
  explode(v: number): void;
  focus(id: string | null, v: number): void;
  spin(r: number): void;
  setFinish(name: string): void;
  setGhost(on: boolean): void;
};

const MOBILE_MQ = "(max-width: 759px)";
const subscribeMobile = (cb: () => void) => {
  const mq = matchMedia(MOBILE_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const MONO = "var(--font-plex-mono), ui-monospace, monospace";

export default function Landing() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [active, setActive] = useState(-1);
  const mobile = useSyncExternalStore(subscribeMobile, () => matchMedia(MOBILE_MQ).matches, () => false);

  const [po, setPo] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [already, setAlready] = useState(false);
  const [serverError, setServerError] = useState("");
  const [honey, setHoney] = useState("");

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const reduced = useRef(false);

  const progress = () => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  };

  const update = useCallback(() => {
    const p = progress();
    let ex = ss(0.05, 0.15, p);
    if (p > 0.95) ex = 1 - ss(0.95, 1, p);
    let act = -1, f = 0, s = 0;
    if (p >= S && p < E) {
      const x = (p - S) / LEN;
      act = Math.min(N - 1, Math.floor(x));
      s = x - act;
      f = ss(0, 0.22, s) * (1 - ss(0.78, 1, s));
    }
    const eng = engineRef.current;
    if (eng) {
      eng.explode(ex);
      eng.focus(act >= 0 ? PARTS[act].id : null, f);
      eng.spin(p * 1.1);
    }
    setPhase(p < 0.075 ? "intro" : p >= E ? "outro" : act >= 0 && s > 0.14 && s < 0.86 ? "part" : "none");
    setActive(act);
  }, []);

  const jump = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    const total = el.offsetHeight - innerHeight;
    scrollTo({ top: top + (S + LEN * (i + 0.5)) * total, behavior: reduced.current ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let findT: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
    };
    const onResize = () => onScroll();
    const onPick = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      const i = PARTS.findIndex((p) => p.id === id);
      if (i >= 0) jump(i);
    };
    const findEngine = () => {
      const el = stageRef.current?.querySelector("trailmate-3d") as Engine | null;
      if (el && typeof el.explode === "function") {
        engineRef.current = el;
        el.addEventListener("pick", onPick);
        el.setFinish("grafite");
        el.setGhost(true);
        onScroll();
      } else {
        findT = setTimeout(findEngine, 120);
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    findEngine();
    onScroll();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      clearTimeout(findT);
      cancelAnimationFrame(raf);
      engineRef.current?.removeEventListener("pick", onPick);
    };
  }, [update, jump]);

  const openPO = (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    prevFocus.current = document.activeElement as HTMLElement | null;
    setPo(true);
    setStep("form");
    setTried(false);
    setServerError("");
    document.body.style.overflow = "hidden";
    setTimeout(() => firstRef.current?.focus(), 60);
  };
  const closePO = useCallback(() => {
    setPo(false);
    document.body.style.overflow = "";
    prevFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!po) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePO(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [po, closePO]);

  const emailBad = tried && !EMAIL_RE.test(email.trim());

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setTried(true); return; }
    setSending(true);
    setServerError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company: honey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_email") setTried(true);
        else setServerError("Something went wrong. Please try again in a moment.");
        return;
      }
      setAlready(!!data.alreadyRegistered);
      setStep("done");
      if (panelRef.current) panelRef.current.scrollTop = 0;
    } catch {
      setServerError("Network error. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  // Layout values (from the original design)
  const base = mobile ? "0%" : "-50%";
  const tf = (on: boolean) => `translateY(calc(${base} + ${on ? 0 : 14}px))`;
  const halo = mobile
    ? "radial-gradient(ellipse 90% 50% at 50% 30%, #2a2e33 0%, #17191c 55%, #0f1012 100%)"
    : "radial-gradient(ellipse 50% 70% at 70% 48%, #2a2e33 0%, #17191c 55%, #0f1012 100%)";
  const frame: CSSProperties = {
    position: "absolute", pointerEvents: "none", zIndex: 2,
    left: mobile ? "12px" : "clamp(24px, 6vw, 104px)", right: mobile ? "12px" : "auto",
    top: mobile ? "auto" : "0", bottom: mobile ? "12px" : "0", width: mobile ? "auto" : "min(460px, 40vw)",
  };
  const panel = (on: boolean, t: string): CSSProperties => ({
    position: "absolute", left: 0, right: 0,
    top: mobile ? "auto" : "50%", bottom: mobile ? "0" : "auto",
    transform: tf(on), opacity: on ? 1 : 0, transition: t,
    background: mobile ? "rgba(18,20,22,0.9)" : "transparent",
    padding: mobile ? "20px" : "0", borderRadius: mobile ? "16px" : "0",
  });
  const eyebrow: CSSProperties = { fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f0712c" };
  const T_BIG = "opacity .6s ease, transform .7s cubic-bezier(.2,.7,.2,1)";
  const T_PART = "opacity .5s ease, transform .6s cubic-bezier(.2,.7,.2,1)";

  return (
    <div style={{ background: "#0f1012", color: "#eceeef" }}>
      <div ref={trackRef} style={{ position: "relative", height: "1100vh" }}>
        <div ref={stageRef} data-screen-label="Trailmate exploded" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: halo }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <trailmate-3d />
          </div>

          <header style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px clamp(16px, 6vw, 104px)", pointerEvents: "none", zIndex: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4be37a", boxShadow: "0 0 12px #4be37a" }} />
              <span style={{ fontWeight: 700, fontStretch: "118%", letterSpacing: "0.08em", fontSize: 15 }}>TRAILMATE</span>
            </div>
            <nav aria-label="Components" style={{ display: "flex", gap: 2, pointerEvents: "auto" }}>
              {PARTS.map((p, i) => {
                const cur = active === i;
                return (
                  <button key={p.id} type="button" className="dot" onClick={() => jump(i)} aria-label={`${p.num} · ${p.title}`} title={p.title}>
                    <span className="mono" style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: cur ? "#f0712c" : "rgba(15,16,18,0.5)", color: cur ? "#121416" : "#a9b0b7", border: `1px solid ${cur ? "#f0712c" : "rgba(255,255,255,0.18)"}`, transition: "background .3s, color .3s, border-color .3s" }}>
                      {p.num}
                    </span>
                  </button>
                );
              })}
            </nav>
          </header>

          <div style={frame}>
            <section style={panel(phase === "intro", T_BIG)}>
              <div style={{ ...eyebrow, marginBottom: 20 }}>Active mountain safety</div>
              <h1 className="balance" style={{ margin: 0, fontSize: "clamp(38px, 5.2vw, 76px)", lineHeight: 0.98, fontWeight: 750, fontStretch: "112%", letterSpacing: "-0.015em" }}>An extra pair of eyes on the trail.</h1>
              <p className="pretty" style={{ margin: "22px 0 0", fontSize: "clamp(16px, 1.25vw, 19px)", lineHeight: 1.5, color: "#a9b0b7", maxWidth: "40ch" }}>Trailmate is a small AI device that clips onto your backpack, watches the trail and the sky, and steps in before a mishap becomes an accident.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36, fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d9dde0" }}>
                <span style={{ width: 1, height: 36, background: "linear-gradient(#f0712c, rgba(240,113,44,0))" }} />
                <span>Scroll to open</span>
              </div>
            </section>

            {PARTS.map((p, i) => {
              const on = phase === "part" && active === i;
              return (
                <section key={p.id} aria-hidden={!on} style={panel(on, T_PART)}>
                  <div style={{ ...eyebrow, display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
                    <span>{p.num} / 07</span>
                    <span style={{ color: "#6c737a" }}>·</span>
                    <span style={{ color: "#d9dde0" }}>{p.role}</span>
                  </div>
                  <h2 className="balance" style={{ margin: 0, fontSize: "clamp(28px, 3.6vw, 54px)", lineHeight: 1.0, fontWeight: 720, fontStretch: "110%", letterSpacing: "-0.01em" }}>{p.title}</h2>
                  <p className="pretty" style={{ margin: "18px 0 0", fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.5, color: "#a9b0b7" }}>{p.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", marginTop: 26, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    {p.points.map((pt) => (
                      <div key={pt.k} style={{ display: "grid", gridTemplateColumns: "112px minmax(0,1fr)", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8e969e", paddingTop: 3 }}>{pt.k}</div>
                        <div className="pretty" style={{ fontSize: 15, lineHeight: 1.45, color: "#e2e5e7" }}>{pt.v}</div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <section style={{ ...panel(phase === "outro", T_BIG), pointerEvents: phase === "outro" ? "auto" : "none" }}>
              <div style={{ ...eyebrow, marginBottom: 20 }}>All in the palm of your hand</div>
              <h2 className="balance" style={{ margin: 0, fontSize: "clamp(34px, 4.6vw, 68px)", lineHeight: 0.98, fontWeight: 750, fontStretch: "112%", letterSpacing: "-0.015em" }}>Seven senses. Zero bars of signal.</h2>
              <p className="pretty" style={{ margin: "20px 0 0", fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.5, color: "#a9b0b7", maxWidth: "40ch" }}>Every decision is made on the device. When you need help, Trailmate calls rescue via satellite.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, fontSize: 14, color: "#d9dde0" }}>
                <span style={{ position: "relative", width: 22, height: 22, flex: "none", border: "1px solid rgba(255,74,61,0.6)", borderRadius: 4 }}>
                  <span style={{ position: "absolute", left: 3, right: 3, top: 10, height: 2, background: "#ff4a3d", transform: "rotate(45deg)" }} />
                  <span style={{ position: "absolute", left: 3, right: 3, top: 10, height: 2, background: "#ff4a3d", transform: "rotate(-45deg)" }} />
                </span>
                <span><strong style={{ fontWeight: 600 }}>SIM — not needed.</strong> Works even where your phone has no signal.</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                <a href="#preorder" onClick={openPO} className="btn-primary">Pre-order Trailmate</a>
                <a href="#scheda" className="btn-ghost">Download the spec sheet</a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="mono" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, padding: "40px clamp(16px, 6vw, 104px)", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8e969e" }}>
        <span>Trailmate</span>
        <span>Designed for those who go high</span>
      </footer>

      {po && (
        <div onClick={closePO} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,9,10,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, color: "#eceeef" }}>
          <div role="dialog" aria-modal="true" aria-labelledby="po-title" onClick={(e) => e.stopPropagation()} ref={panelRef} style={{ position: "relative", width: "100%", maxWidth: 560, maxHeight: "calc(100vh - 32px)", overflowY: "auto", background: "#16181a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
            <button type="button" onClick={closePO} aria-label="Close" className="btn-close">×</button>

            {step === "form" ? (
              <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 22, padding: "32px clamp(20px, 5vw, 36px) 32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingRight: 48 }}>
                  <div style={eyebrow}>Waiting list</div>
                  <h2 id="po-title" style={{ margin: 0, fontSize: 34, lineHeight: 1, fontWeight: 750, fontStretch: "112%", letterSpacing: "-0.015em" }}>Pre-order Trailmate</h2>
                  <p className="pretty" style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#a9b0b7" }}>Leave your email and we’ll let you know when Trailmate is ready.</p>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8e969e" }}>Email</span>
                  <input ref={firstRef} type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" aria-invalid={emailBad} className={`field${emailBad ? " bad" : ""}`} />
                  {emailBad && <span style={{ fontSize: 13, color: "#ff7a6b" }}>Enter a valid email</span>}
                </label>
                <label className="sr-only" aria-hidden="true">
                  Company
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
                </label>
                {serverError && <p role="alert" style={{ margin: 0, fontSize: 14, color: "#ff7a6b" }}>{serverError}</p>}
                <button type="submit" className="btn-primary" disabled={sending} style={{ minHeight: 52, fontWeight: 700 }}>
                  {sending ? "Saving…" : "Confirm pre-order"}
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "32px clamp(20px, 5vw, 36px) 32px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#0c9a5b", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 22, fontWeight: 700 }}>✓</div>
                <h2 id="po-title" style={{ margin: 0, paddingRight: 48, fontSize: 34, lineHeight: 1, fontWeight: 750, fontStretch: "112%", letterSpacing: "-0.015em" }}>
                  {already ? "You’re already on the list" : "You’re on the list"}
                </h2>
                <p className="pretty" style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#a9b0b7" }}>
                  We’ll write to <strong style={{ color: "#eceeef", fontWeight: 600 }}>{email.trim()}</strong> as soon as Trailmate is available.
                </p>
                <button type="button" onClick={closePO} className="btn-primary" style={{ fontSize: 15, fontWeight: 700 }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
