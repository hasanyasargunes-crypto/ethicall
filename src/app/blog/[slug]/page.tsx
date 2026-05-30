import { sanityFetch } from "@/sanity/client";
import { blogPostBySlugQuery, blogPostsQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { BlogPost } from "@/sanity/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PortableText } from "@portabletext/react";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  let posts: BlogPost[] = [];
  try {
    posts = await sanityFetch<BlogPost[]>(blogPostsQuery);
  } catch {
    /* skip */
  }
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  let post: BlogPost | null = null;
  try {
    post = await sanityFetch<BlogPost>(blogPostBySlugQuery, { slug });
  } catch {
    /* fallback */
  }
  if (!post) return {};

  const title = post.seo?.title ?? `${post.title} | EthicAll Blog`;
  const description = post.seo?.description ?? post.excerpt ?? "";

  return {
    title,
    description,
    keywords: post.seo?.keywords,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "tr_TR",
      siteName: "EthicAll Blog",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      ...(post.seo?.ogImage
        ? { images: [{ url: urlFor(post.seo.ogImage).width(1200).height(630).url() }] }
        : post.coverImage?.asset
          ? { images: [{ url: urlFor(post.coverImage).width(1200).height(630).url() }] }
          : {}),
    },
  };
}

const portableTextComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      if (!value?.asset) return null;
      return (
        <figure style={{ margin: "32px 0" }}>
          <Image
            src={urlFor(value).width(960).url()}
            alt={value.alt ?? ""}
            width={960}
            height={540}
            style={{ width: "100%", height: "auto", borderRadius: 12 }}
          />
          {value.caption && (
            <figcaption
              style={{
                fontSize: 13,
                color: "var(--lp-ink-soft)",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value: any }) => {
      const rel = value.blank ? "noopener noreferrer" : undefined;
      const target = value.blank ? "_blank" : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          style={{ color: "var(--lp-green-700)", textDecoration: "underline" }}
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        className="lp-display"
        style={{
          fontSize: 28,
          fontWeight: 600,
          margin: "40px 0 16px",
          letterSpacing: "-0.02em",
          color: "var(--lp-ink)",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3
        className="lp-display"
        style={{
          fontSize: 22,
          fontWeight: 600,
          margin: "32px 0 12px",
          letterSpacing: "-0.01em",
          color: "var(--lp-ink)",
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4
        className="lp-display"
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: "28px 0 10px",
          color: "var(--lp-ink)",
        }}
      >
        {children}
      </h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote
        style={{
          borderLeft: "3px solid var(--lp-green-700)",
          margin: "28px 0",
          padding: "12px 24px",
          color: "var(--lp-ink-muted)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.7,
          background: "var(--lp-green-50)",
          borderRadius: "0 8px 8px 0",
        }}
      >
        {children}
      </blockquote>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.75,
          color: "var(--lp-ink-2)",
          margin: "0 0 20px",
        }}
      >
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul style={{ margin: "16px 0", paddingLeft: 24, fontSize: 17, lineHeight: 1.75, color: "var(--lp-ink-2)" }}>
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol style={{ margin: "16px 0", paddingLeft: 24, fontSize: 17, lineHeight: 1.75, color: "var(--lp-ink-2)" }}>
        {children}
      </ol>
    ),
  },
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(blocks?: any[]) {
  if (!blocks) return "1 dk";
  const text = blocks
    .filter((b: any) => b._type === "block")
    .map((b: any) => b.children?.map((c: any) => c.text).join("") ?? "")
    .join(" ");
  const mins = Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  return `${mins} dk okuma`;
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  let post: BlogPost | null = null;
  try {
    post = await sanityFetch<BlogPost>(blogPostBySlugQuery, { slug });
  } catch {
    /* fallback */
  }

  if (!post) notFound();

  return (
    <div style={{ background: "var(--lp-bg-paper)", color: "var(--lp-ink)", minHeight: "100vh" }}>
      {/* Nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(250,248,244,0.85)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--lp-border)",
        }}
      >
        <div
          className="lp-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 32px",
          }}
        >
          <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span
              className="lp-display"
              style={{ fontSize: 19, fontWeight: 600, color: "var(--lp-ink)" }}
            >
              Ethic<span style={{ color: "var(--lp-green-700)" }}>All</span>
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--lp-green-700)",
                background: "var(--lp-green-50)",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              Blog
            </span>
          </Link>
          <Link
            href="/#demo"
            className="lp-btn lp-btn-primary"
            style={{ padding: "10px 18px", fontSize: 14 }}
          >
            Demo Talep Et
          </Link>
        </div>
      </header>

      <article style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 100px" }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 32, fontSize: 13, color: "var(--lp-ink-soft)" }}>
          <Link href="/blog" style={{ color: "var(--lp-green-700)", textDecoration: "none" }}>
            ← Blog
          </Link>
        </nav>

        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {post.categories.map((cat) => (
              <span
                key={cat.slug}
                className="lp-mono"
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: "var(--lp-green-50)",
                  color: "var(--lp-green-700)",
                  letterSpacing: "0.06em",
                }}
              >
                {cat.title}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1
          className="lp-display"
          style={{
            fontSize: "clamp(30px, 4.5vw, 44px)",
            fontWeight: 600,
            margin: "0 0 20px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "var(--lp-ink)",
            textWrap: "balance" as any,
          }}
        >
          {post.title}
        </h1>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 36,
            fontSize: 14,
            color: "var(--lp-ink-soft)",
            flexWrap: "wrap",
          }}
        >
          {post.author && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {post.author.avatar?.asset && (
                <Image
                  src={urlFor(post.author.avatar).width(80).height(80).url()}
                  alt={post.author.name}
                  width={36}
                  height={36}
                  style={{ borderRadius: 99, objectFit: "cover" }}
                />
              )}
              <div>
                <div style={{ fontWeight: 600, color: "var(--lp-ink)", fontSize: 14 }}>
                  {post.author.name}
                </div>
                {post.author.role && (
                  <div style={{ fontSize: 12, color: "var(--lp-ink-soft)" }}>{post.author.role}</div>
                )}
              </div>
            </div>
          )}
          {post.publishedAt && (
            <>
              <span style={{ color: "var(--lp-border-strong)" }}>·</span>
              <time>{formatDate(post.publishedAt)}</time>
            </>
          )}
          <span style={{ color: "var(--lp-border-strong)" }}>·</span>
          <span>{readingTime(post.body)}</span>
        </div>

        {/* Cover Image */}
        {post.coverImage?.asset && (
          <div
            style={{
              position: "relative",
              aspectRatio: "16/9",
              borderRadius: "var(--lp-radius-lg)",
              overflow: "hidden",
              marginBottom: 40,
              border: "1px solid var(--lp-border)",
            }}
          >
            <Image
              src={urlFor(post.coverImage).width(1200).height(675).url()}
              alt={post.coverImage.alt ?? post.title}
              fill
              style={{ objectFit: "cover" }}
              priority
              sizes="(max-width: 740px) 100vw, 740px"
            />
          </div>
        )}

        {/* Body */}
        {post.body && (
          <div className="blog-body">
            <PortableText value={post.body} components={portableTextComponents as any} />
          </div>
        )}

        {/* Divider + CTA */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 40,
            borderTop: "1px solid var(--lp-border)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, color: "var(--lp-ink-muted)", margin: "0 0 20px" }}>
            EthicAll ile etik altyapınızı kurun.
          </p>
          <Link
            href="/#demo"
            className="lp-btn lp-btn-primary"
            style={{ padding: "14px 24px", fontSize: 15 }}
          >
            Demo Talep Et
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--lp-border)",
          padding: "32px",
          textAlign: "center",
          fontSize: 13,
          color: "var(--lp-ink-soft)",
        }}
      >
        &copy; {new Date().getFullYear()} EthicAll. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
