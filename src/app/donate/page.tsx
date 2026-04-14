import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Heart, Smartphone } from "lucide-react";
import { readJsonFile } from "@/lib/read-data";
import { donationQrSrc } from "@/lib/donation-qr";
import { CopyPhoneButton } from "@/components/copy-phone-button";

export const metadata: Metadata = {
  title: "दान",
  description: "चरावां गाँव के विकास में योगदान — UPI व QR।",
};

type DonateJson = {
  banner: { title: string; image: string; mobileImage: string };
  heading: string;
  upiId: string;
  qrImage: string;
  screenshotNoteHref: string;
  screenshotNoteLabel: string;
  bodyParagraphs: string[];
};

export default async function DonatePage() {
  const data = await readJsonFile<DonateJson>("donate.json");

  return (
    <div className="village-page-bg">
      <div className="relative mx-auto max-w-5xl overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        <div className="relative aspect-[21/9] min-h-[11rem] w-full sm:min-h-[14rem]">
          <Image
            src={data.banner.image}
            alt={data.banner.title}
            fill
            className="object-cover object-center sm:hidden"
            sizes="100vw"
            priority
          />
          <Image
            src={data.banner.image}
            alt={data.banner.title}
            fill
            className="hidden object-cover object-center sm:block"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent sm:hidden" />
          <Image
            src={data.banner.mobileImage}
            alt=""
            fill
            className="object-cover object-center opacity-0 sm:opacity-100"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 hidden p-6 text-white sm:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">दान</p>
          <p className="mt-1 font-serif text-2xl font-bold drop-shadow-md">{data.banner.title}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:space-y-12 sm:py-12">
        <h1 className="text-center font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {data.heading}
        </h1>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-lg ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:ring-white/10">
            <img
              src={donationQrSrc(data.qrImage)}
              alt="दान हेतु फोनपे QR कोड"
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-6">
            {data.bodyParagraphs.map((p, i) => (
              <p
                key={i}
                className="text-base font-semibold leading-relaxed text-foreground/95 sm:text-lg"
              >
                {i === 0 ? (
                  <>
                    सबसे पहले तो हम आपका बहुत बहुत आभार प्रगट करते हैं आपने डोनेशन में अपनी रूचि दिखाई,
                    अगर आप भी <span className="font-extrabold text-red-600 dark:text-red-400">चरावां गांव के विकास</span> में
                    योगदान देना चाहते हैं तो नीचे दिए गए QR कोड या फिर इस UPI ID{" "}
                    <span className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-2 py-1 font-mono text-sm font-extrabold text-slate-900 dark:bg-amber-400">
                      <Smartphone className="h-4 w-4" aria-hidden />
                      {data.upiId}
                    </span>{" "}
                    पर कोई भी राशि भेज सकते हैं। आपके द्वारा भेजी गयी राशि आप पर निर्भर करता है की आप उसे गुप्त रखना
                    चाहते है या फिर आप दूसरों को भी बताना चाहेंगे जिससे और लोग आप के मदद से प्रेरित होकर सामने आये।
                    आपके द्वारा दी गयी राशि कुछ भी हो सकती है —{" "}
                    <span className="font-extrabold text-red-600 dark:text-red-400">1 रूपये का</span> भी किया गया दान
                    सराहनीये होगा। धन्यवाद।
                  </>
                ) : (
                  <>
                    <span className="font-extrabold text-red-600 dark:text-red-400">नोट :-</span> किसी भी राशि को भेजने
                    के बाद कृपया{" "}
                    <Link href={data.screenshotNoteHref} className="font-extrabold text-accent underline">
                      {data.screenshotNoteLabel}
                    </Link>{" "}
                    पर क्लिक करके पेमेंट का स्क्रीनशॉट हम तक ज़रूर पहुँचा दें। साथ में आप ये भी लिख सकते हैं की हम
                    आपके द्वारा प्राप्त राशि कहाँ और किस प्रकार प्रयोग करें। अगर आप इसे गुप्त रखना चाहते हैं तो हम
                    आपका धन्यवाद देते हैं और हम आपको आशा दिलाते हैं की आपके द्वारा दी हुई राशि का हम सही जगह और सही
                    समय पर प्रयोग करेंगे। धन्यवाद।
                  </>
                )}
              </p>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <CopyPhoneButton
                textToCopy={data.upiId}
                label="UPI कॉपी करें"
                className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-xs font-bold dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
          </div>
        </div>

        <p className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-muted">
          <Heart className="h-4 w-4 text-red-500" aria-hidden />
          चरावां डिजिटल पहल — आपके सहयोग से
        </p>
      </div>
    </div>
  );
}
