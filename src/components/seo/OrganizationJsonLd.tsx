import { COMPANY } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";

/**
 * schema.org LocalBusiness structured data. Deliberately excludes any
 * warehouse/facility addresses — only the public office address is ever
 * disclosed, matching the site's confidentiality policy.
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.name,
    url: SITE_URL,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    description:
      "Full-service pickup-and-delivery storage for personal and corporate customers across Singapore, with recycled-pallet and wooden-crate storage methods run at ambient temperature for a lower carbon footprint than traditional self-storage.",
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address,
      addressCountry: "SG",
    },
    areaServed: "Singapore",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
