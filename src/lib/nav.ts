export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/personal", label: "Personal" },
  { href: "/corporate", label: "Corporate" },
  { href: "/mission", label: "Our Mission" },
  { href: "/services", label: "Services" },
  { href: "/resources", label: "Resources" },
  { href: "/partner", label: "Be a Partner" },
  { href: "/contact", label: "Contact" },
] as const;

export const MANAGED_PAGES = [
  { slug: "home", title: "Home" },
  { slug: "personal", title: "Personal" },
  { slug: "corporate", title: "Corporate" },
  { slug: "mission", title: "Our Mission" },
  { slug: "services", title: "Services" },
  { slug: "resources", title: "Resources" },
  { slug: "partner", title: "Be a Partner" },
  { slug: "contact", title: "Contact" },
] as const;

export const COMPANY = {
  name: "EcoStorage",
  address: "128 Harbour Road, Unit 4, Seattle, WA 98101",
  email: "hello@storagespace.com",
  phone: "(206) 555-0148",
  googleReviewUrl: "#",
};
