import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="/skill-trait-webflow/index.html"
        className="w-full h-full border-0"
        title="SkillTrait Home"
      />
    </div>
  );
}
