import WebflowIframe from "@/components/WebflowIframe";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SkillTrait: Digital Awards for Work",
  description: "SkillTrait - Professional skill verification platform for digital awards and recognition",
};

export default function Home() {
  return (
    <WebflowIframe 
      src={`/skill-trait-webflow/index.html?v=${Date.now() + Math.random()}`}
      title="SkillTrait: Digital Awards for Work"
    />
  );
}
