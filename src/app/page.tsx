import { sanityFetch } from "@/sanity/client";
import { landingPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { LandingPageData } from "@/sanity/types";
import type { Metadata } from "next";
import LandingClient from "@/components/landing/LandingClient";

export async function generateMetadata(): Promise<Metadata> {
  let data: LandingPageData | null = null;
  try {
    data = await sanityFetch<LandingPageData>(landingPageQuery);
  } catch {
    /* fallback to defaults */
  }

  const title = data?.seo?.title ?? "EthicAll - Anonim Etik İhbar Platformu";
  const description =
    data?.seo?.description ??
    "Kurumsal şirketler için anonim etik ihbar hattı, KVKK başvuru yönetimi ve tedarikçi uyum platformu.";

  return {
    title,
    description,
    keywords: data?.seo?.keywords ?? [
      "etik ihbar",
      "whistleblowing",
      "KVKK",
      "anonim ihbar",
      "uyum",
      "compliance",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "tr_TR",
      siteName: "EthicAll",
      ...(data?.seo?.ogImage
        ? { images: [{ url: urlFor(data.seo.ogImage).width(1200).height(630).url() }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home() {
  let data: LandingPageData | null = null;
  try {
    data = await sanityFetch<LandingPageData>(landingPageQuery);
  } catch {
    /* fallback to hardcoded content in components */
  }

  return <LandingClient data={data} />;
}
