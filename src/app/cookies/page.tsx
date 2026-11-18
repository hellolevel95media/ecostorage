import { CookiePreference } from "@/components/ui/CookiePreference";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "How we use essential cookies, analytics and marketing pixels on this website, and how you can opt out.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-foreground/70">
        <p>
          EcoStorage uses a small number of cookies to run this site. We split them into four
          categories. You choose how much analytics and measurement runs below.
        </p>
        <CookiePreference />
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
            We record anonymous page-visit data (the page path, referring page, and browser
            type) so we can understand which pages are useful. We also use Google Analytics to
            measure visits, time spent on the site, how visitors found us, and actions such as
            opening the enquiry form. Google processes this data on our behalf; it is not used
            for advertising. We never collect names or other personal identifiers through these
            tools.
          </p>
          <p className="mt-2">
            You have three levels, set at the top of this page. <strong>Full analytics</strong>{" "}
            (the default) lets Google Analytics set cookies named <code>_ga</code> and{" "}
            <code>_ga_&lt;ID&gt;</code>, kept for up to 2 years, so returning visitors are
            recognised. <strong>Anonymous analytics</strong> sets no cookies at all; events are
            counted without any identifier, so repeat visits cannot be linked. <strong>Off</strong>{" "}
            stops analytics entirely. Changes take effect immediately on this device.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Marketing pixels</h2>
          <p className="mt-1">
            With full analytics on (the default), we also load the Meta Pixel and the TikTok
            Pixel. They tell us when a visit from our Instagram, Facebook or TikTok posts leads
            to an enquiry, so we know which posts are useful. Meta and TikTok may set their own
            cookies (for example <code>_fbp</code> and <code>_ttp</code>) and can link the visit
            to your account on their platform under their own privacy policies. We do not send
            them your name, email, phone number or message. Choosing Anonymous analytics or Off
            at the top of this page stops both pixels from loading.
          </p>
        </div>
        <p>Contact hello@ecostorage.sg with any cookie or privacy questions.</p>
      </div>
    </section>
  );
}
