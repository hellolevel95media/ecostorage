import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "How we use essential and optional analytics cookies on this website, and how you can accept or decline them.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-foreground/70">
        <p>
          EcoStorage uses a small number of cookies to run this site. We split them into three
          categories. Analytics cookies are only ever active with your consent.
        </p>
        <div>
          <h2 className="font-semibold text-foreground">Essential cookies</h2>
          <p className="mt-1">
            Used to keep administrators signed in to the EcoStorage CMS (/admin) and to remember
            your cookie preference. The site cannot function correctly for our staff without
            these, so they are not optional.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Referral cookie</h2>
          <p className="mt-1">
            If you arrive through a link shared by one of our affiliates, we store a cookie
            called <code>eco_ref</code> for 14 days. It holds only the affiliate&apos;s referral
            code and the time you clicked, so we can credit the right affiliate if you go on to
            send us an enquiry. It contains no personal information and is not used for
            advertising or tracking across other sites. You can delete it at any time by
            clearing your browser&apos;s cookies for this site.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Analytics cookies</h2>
          <p className="mt-1">
            With your consent, we record anonymous page-visit data (the page path, referring
            page, and browser type) so we can understand which pages are useful. We never
            collect IP addresses, names, or other personal identifiers through this system, and
            it only runs after you accept cookies in the banner shown on your first visit. You
            can withdraw consent at any time by clearing your browser&apos;s local storage for
            this site.
          </p>
        </div>
        <p>Contact hello@ecostorage.sg with any cookie or privacy questions.</p>
      </div>
    </section>
  );
}
