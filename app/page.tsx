import Script from "next/script";
import Landing from "./landing";

export default function Home() {
  return (
    <>
      <Landing />
      <Script src="/trailmate-engine.js" strategy="afterInteractive" />
    </>
  );
}
