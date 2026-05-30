import { sanityFetch } from "@/sanity/client";
import { blogPostsPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { BlogPageData, BlogPost } from "@/sanity/types";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog | EthicAll",
  description:
    "Etik uyum, KVKK, whistleblowing ve kurumsal yönetişim hakkında güncel yazılar.",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "flex",
        flexDirection: featured ? "row" : "column",
        gap: featured ? 32 : 0,
        background: "var(--lp-bg-white)",
        borderRadius: "var(--lp-radius-lg)",
        border: "1px solid var(--lp-border)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 220ms ease, transform 220ms ease",
      }}
      className="blog-card"
    >
      {post.coverImage?.asset && (
        <div
          style={{
            position: "relative",
            width: featured ? "50%" : "100%",
            aspectRatio: featured ? "4/3" : "16/9",
            flexShrink: 0,
            overflow: "hidden",
            background: "var(--lp-green-50)",
          }}
        >
          <Image
            src={urlFor(post.coverImage).width(featured ? 800 : 600).height(featured ? 600 : 338).url()}
            alt={post.coverImage.alt ?? post.title}
            fill
            style={{ objectFit: "cover" }}
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </div>
      )}
      <div style={{ padding: featured ? "32px 32px 32px 0" : "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        {post.categories && post.categories.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
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
        <h2
          className="lp-display"
          style={{
            fontSize: featured ? 28 : 20,
            fontWeight: 600,
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            color: "var(--lp-ink)",
          }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p
            style={{
              fontSize: featured ? 16 : 14.5,
              lineHeight: 1.6,
              color: "var(--lp-ink-muted)",
              margin: "0 0 16px",
              display: "-webkit-box",
              WebkitLineClamp: featured ? 4 : 3,
              WebkitBoxOrient: "vertical" as any,
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          {post.author?.avatar?.asset && (
            <Image
              src={urlFor(post.author.avatar).width(64).height(64).url()}
              alt={post.author.name}
              width={28}
              height={28}
              style={{ borderRadius: 99, objectFit: "cover" }}
            />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--lp-ink-soft)" }}>
            {post.author && <span style={{ fontWeight: 500 }}>{post.author.name}</span>}
            {post.author && post.publishedAt && <span>·</span>}
            {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  let data: BlogPageData | null = null;
  try {
    data = await sanityFetch<BlogPageData>(blogPostsPageQuery);
  } catch {
    /* fallback */
  }

  const posts = data?.posts ?? [];
  const categories = data?.categories ?? [];
  const featuredPost = posts.find((p) => p.featured) ?? posts[0];
  const otherPosts = posts.filter((p) => p._id !== featuredPost?._id);

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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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

      <main className="lp-container" style={{ padding: "60px 32px 100px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="lp-eyebrow" style={{ display: "inline-flex" }}>
            <span className="lp-eyebrow-dot" />
            Blog
          </span>
          <h1
            className="lp-display"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 500,
              margin: "18px 0 0",
              letterSpacing: "-0.03em",
              color: "var(--lp-ink)",
            }}
          >
            Uyum ve etik dünyasından{" "}
            <em
              style={{
                fontFamily: "var(--font-display), serif",
                fontStyle: "normal",
                color: "var(--lp-green-700)",
              }}
            >
              güncel
            </em>{" "}
            yazılar
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--lp-ink-muted)",
              margin: "16px auto 0",
              maxWidth: 560,
            }}
          >
            KVKK, GDPR, whistleblowing ve kurumsal yönetişim konularında
            pratik rehberler ve sektör analizleri.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 40,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {categories.map((cat) => (
              <span
                key={cat.slug}
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: 99,
                  border: "1px solid var(--lp-border)",
                  background: "var(--lp-bg-white)",
                  color: "var(--lp-ink-2)",
                }}
              >
                {cat.title}
                {cat.count != null && (
                  <span style={{ marginLeft: 6, color: "var(--lp-ink-soft)", fontSize: 12 }}>
                    {cat.count}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "var(--lp-ink-muted)",
            }}
          >
            <p style={{ fontSize: 18, margin: "0 0 8px" }}>Henüz blog yazısı yayınlanmadı.</p>
            <p style={{ fontSize: 14 }}>
              Sanity Studio&apos;dan ilk yazınızı ekleyin →{" "}
              <Link href="/studio" style={{ color: "var(--lp-green-700)", textDecoration: "underline" }}>
                /studio
              </Link>
            </p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featuredPost && (
              <div style={{ marginBottom: 48 }}>
                <PostCard post={featuredPost} featured />
              </div>
            )}

            {/* Grid */}
            {otherPosts.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 24,
                }}
              >
                {otherPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

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
