import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import GlidePathApp from "@/components/glide-path/GlidePathApp";
import Methodology from "@/components/glide-path/Methodology";

export const metadata: Metadata = {
  alternates: { canonical: "/glide-path" },
  title: "Lifecycle Allocation",
  description:
    "Should your stock share change with age, or stay constant? A research model built on return assumptions and market history.",
};

export default function GlidePathPage() {
  return (
    <>
      <Header
        title="Lifecycle Allocation"
        subtitle="Should your stock share change with age, or stay constant? A research model that answers from your plan, return assumptions and market history."
        showHomeLink
        eyebrow="03 / Lifecycle Allocation"
        status="new"
        tags={["Research model", "CRRA utility"]}
      />
      <main>
        <GlidePathApp />
        <Methodology />
      </main>
      <Footer />
    </>
  );
}
