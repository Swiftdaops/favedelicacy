"use client";

export default function Footer() {
  return (
    <footer className="site-bg text-stone-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Top section */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              FaveDelicacy
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-950/90">
              FaveDelicacy is a premium food brand offering freshly prepared,
              delicious meals with fast and reliable delivery services in
              <strong> Ifite, Awka</strong> and surrounding areas. We are committed
              to quality, hygiene, and customer satisfaction.
            </p>
          </div>

          {/* Delivery Areas */}
          <nav aria-label="Delivery areas in Awka">
            <h3 className="mb-4 text-lg font-semibold">
              Delivery Locations
            </h3>
            <ul className="space-y-2 text-sm text-stone-950/90">
              <li>Food delivery in Ifite Awka</li>
              <li>Fast food delivery in Awka</li>
              <li>Student meal delivery – Ifite</li>
              <li>Office lunch delivery in Awka</li>
              <li>Hot meals delivered near UNIZIK</li>
            </ul>
          </nav>

          {/* Popular Meals */}
          <nav aria-label="Popular meals">
            <h3 className="mb-4 text-lg font-semibold">
              Popular Meals
            </h3>
            <ul className="space-y-2 text-sm text-stone-950/90">
              <li>Jollof Rice & Chicken</li>
              <li>Fried Rice & Turkey</li>
              <li>Ofada Rice & Sauce</li>
              <li>Egusi Soup & Swallow</li>
              <li>Grilled Chicken & Fries</li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Contact & Orders
            </h3>
            <address className="not-italic text-sm text-stone-950/90 space-y-2">
              <p>Ifite, Awka, Anambra State</p>
              <p>Phone: <span className="font-medium">+234 XXX XXX XXXX</span></p>
              <p>Email: <span className="font-medium">orders@favedelicacy.com</span></p>
              <p className="mt-2">
                Open daily from <strong>9am – 9pm</strong>
              </p>
            </address>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-white/12" />

        {/* SEO Paragraph */}
        <div className="max-w-4xl text-sm leading-relaxed text-stone-950/90">
          <p>
            Looking for reliable <strong>food delivery in Ifite Awka</strong>?
            FaveDelicacy brings freshly cooked meals straight to your doorstep.
            Whether you are a student, worker, or resident in Awka, we offer
            affordable meals, fast delivery, and consistent quality. Order
            today and enjoy delicious food without stress.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-stone-950/80">
            © {new Date().getFullYear()} FaveDelicacy. All rights reserved.
          </p>

          <nav aria-label="Footer links" className="flex gap-4 text-xs text-stone-950/80">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
