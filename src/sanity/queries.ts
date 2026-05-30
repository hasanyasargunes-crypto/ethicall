// ─── Blog queries ───

const blogPostFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage {
    ...,
    "alt": alt
  },
  publishedAt,
  featured,
  "author": author-> {
    name,
    "slug": slug.current,
    avatar,
    role
  },
  "categories": categories[]-> {
    title,
    "slug": slug.current
  }
`;

export const blogPostsQuery = `*[_type == "blogPost"] | order(publishedAt desc) {
  ${blogPostFields}
}`;

export const blogPostsPageQuery = `{
  "posts": *[_type == "blogPost"] | order(publishedAt desc) {
    ${blogPostFields}
  },
  "categories": *[_type == "blogCategory"] | order(title asc) {
    title,
    "slug": slug.current,
    description,
    "count": count(*[_type == "blogPost" && references(^._id)])
  }
}`;

export const blogPostBySlugQuery = `*[_type == "blogPost" && slug.current == $slug][0] {
  ${blogPostFields},
  body[] {
    ...,
    _type == "image" => {
      ...,
      "alt": alt
    }
  },
  seo
}`;

export const blogCategoryPostsQuery = `*[_type == "blogPost" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
  ${blogPostFields}
}`;

// ─── Landing page query ───

export const landingPageQuery = `*[_type == "landingPage"][0]{
  seo,
  navLinks,
  navLoginText,
  navCtaText,
  heroTitle,
  heroTitleAccent,
  heroSubtitle,
  heroCtaPrimary,
  heroCtaSecondary,
  heroStats,
  trustLabel,
  trustBadges,
  productsEyebrow,
  productsTitle,
  productsSubtitle,
  productsItems,
  ethicsEyebrow,
  ethicsTitle,
  ethicsSubtitle,
  ethicsCtaText,
  ethicsFeatures,
  howEyebrow,
  howTitle,
  howSubtitle,
  howSteps,
  dashEyebrow,
  dashTitle,
  dashSubtitle,
  securityEyebrow,
  securityTitle,
  securitySubtitle,
  securityItems,
  pricingEyebrow,
  pricingTitle,
  pricingSubtitle,
  pricingPlans,
  faqEyebrow,
  faqTitle,
  faqItems,
  ctaTitle,
  ctaSubtitle,
  ctaPrimary,
  ctaSecondary,
  footerTagline,
  footerColumns,
  footerBadges
}`;
