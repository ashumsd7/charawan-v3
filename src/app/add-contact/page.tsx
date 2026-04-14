import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "नया संपर्क जोड़ें",
  description: "दुकान या सेवा का नया विवरण भेजें।",
};

export default function AddContactPage() {
  return (
    <div className="village-page-bg min-h-screen">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <Link
          href="/shops"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          दुकान सूची पर वापस
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">नया संपर्क जोड़ें</h1>
        <p className="text-sm leading-relaxed text-muted">
          यह पेज जल्द उपलब्ध होगा। अभी नई दुकान या सुधार हेतु कृपया{" "}
          <Link href="/contacts" className="font-semibold text-accent underline">
            सम्पर्क पृष्ठ
          </Link>{" "}
          से जुड़ें।
        </p>
      </div>
    </div>
  );
}
