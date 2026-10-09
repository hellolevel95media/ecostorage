const WHATSAPP_NUMBER = "6588997017";
const WHATSAPP_MESSAGE =
  "Hi EcoStorage! I'd like to find out more about your storage plans.";

export function WhatsAppWidget() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <aside aria-label="Chat with us">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with EcoStorage on WhatsApp"
        className="fixed z-40 flex h-12 w-12 items-center sm:h-14 sm:w-14 justify-center rounded-full bg-[#25D366] text-white shadow-glow transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          right: "calc(1.25rem + var(--safe-r))",
          bottom: "calc(1.25rem + var(--safe-b))",
        }}
      >
        <WhatsAppIcon />
      </a>
    </aside>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.19 0 4.25.85 5.79 2.4a8.15 8.15 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.55 3.7-8.24 8.24-8.24l.05.02Zm-4.53 4.4c-.18 0-.46.06-.7.32-.24.26-.92.9-.92 2.2s.94 2.55 1.07 2.73c.13.18 1.83 2.8 4.44 3.92.62.27 1.1.43 1.48.55.62.2 1.19.17 1.63.1.5-.07 1.53-.62 1.75-1.23.22-.6.22-1.11.15-1.22-.06-.1-.24-.16-.5-.29-.25-.13-1.53-.75-1.77-.84-.24-.09-.41-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.13-.58-1.4-.8-1.9-.2-.5-.42-.43-.58-.44h-.5Z" />
    </svg>
  );
}
