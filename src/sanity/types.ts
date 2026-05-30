export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
}

export interface NavLink {
  label: string;
  href: string;
}

export interface TrustBadge {
  name: string;
  description: string;
}

export interface Product {
  iconName: string;
  tag: string;
  name: string;
  tagline: string;
  description: string;
  points: string[];
  featured: boolean;
  linkText: string;
}

export interface Feature {
  iconName: string;
  title: string;
  description: string;
}

export interface Step {
  num: string;
  iconName: string;
  title: string;
  description: string;
}

export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  featured: boolean;
  badge?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface LandingPageData {
  seo?: {
    title?: string;
    description?: string;
    ogImage?: SanityImage;
    keywords?: string[];
  };
  navLinks?: NavLink[];
  navLoginText?: string;
  navCtaText?: string;
  heroTitle?: string;
  heroTitleAccent?: string;
  heroSubtitle?: string;
  heroCtaPrimary?: string;
  heroCtaSecondary?: string;
  heroStats?: { value: string; label: string }[];
  trustLabel?: string;
  trustBadges?: TrustBadge[];
  productsEyebrow?: string;
  productsTitle?: string;
  productsSubtitle?: string;
  productsItems?: Product[];
  ethicsEyebrow?: string;
  ethicsTitle?: string;
  ethicsSubtitle?: string;
  ethicsCtaText?: string;
  ethicsFeatures?: Feature[];
  howEyebrow?: string;
  howTitle?: string;
  howSubtitle?: string;
  howSteps?: Step[];
  dashEyebrow?: string;
  dashTitle?: string;
  dashSubtitle?: string;
  securityEyebrow?: string;
  securityTitle?: string;
  securitySubtitle?: string;
  securityItems?: Feature[];
  pricingEyebrow?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;
  pricingPlans?: Plan[];
  faqEyebrow?: string;
  faqTitle?: string;
  faqItems?: FaqItem[];
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  footerTagline?: string;
  footerColumns?: FooterColumn[];
  footerBadges?: string[];
}
