
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-16 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-teal-700">
          MemberPass
        </h1>

        <div className="flex gap-5 items-center">
          <a href="#features" className="hidden sm:block hover:text-teal-700">
            Features
          </a>

          <a
            href="#plans"
            className="rounded-lg bg-teal-700 px-5 py-2 text-white hover:bg-teal-800"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center md:py-28">
        <p className="mb-4 font-semibold text-teal-700">
          WELCOME TO THENDRAL YOGA LOFT
        </p>

        <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Your Yoga Journey,
          <span className="text-teal-700"> Made Simpler.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Manage your membership, access your digital pass,
          and enjoy a smoother studio experience with MemberPass.
        </p>

        <a
          href="#plans"
          className="mt-8 inline-block rounded-xl bg-teal-700 px-8 py-4 font-semibold text-white shadow-lg hover:bg-teal-800"
        >
          Explore Memberships
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-6 py-16 md:px-16">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Everything You Need
        </h2>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-slate-50 p-7 shadow-sm">
            <div className="mb-4 text-3xl">🧘</div>
            <h3 className="mb-3 text-xl font-bold">
              Easy Membership
            </h3>
            <p className="text-slate-600">
              View membership options and manage your plan
              in one place.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-7 shadow-sm">
            <div className="mb-4 text-3xl">📱</div>
            <h3 className="mb-3 text-xl font-bold">
              Digital QR Pass
            </h3>
            <p className="text-slate-600">
              Get a digital membership pass for convenient
              studio entry.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-7 shadow-sm">
            <div className="mb-4 text-3xl">✨</div>
            <h3 className="mb-3 text-xl font-bold">
              Smart Reminders
            </h3>
            <p className="text-slate-600">
              Receive helpful membership and attendance
              reminders.
            </p>
          </div>

        </div>
      </section>

      {/* Membership Section */}
      <section id="plans" className="px-6 py-16 text-center md:px-16">
        <h2 className="mb-4 text-3xl font-bold">
          Choose Your Membership
        </h2>

        <p className="mb-10 text-slate-600">
          Find a plan that fits your yoga journey.
        </p>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">

          {["Basic", "Standard", "Premium"].map((plan) => (
            <div
              key={plan}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h3 className="mb-4 text-2xl font-bold">
                {plan}
              </h3>

              <p className="mb-6 text-slate-600">
                Membership details coming soon.
              </p>

              <button
                disabled
                className="w-full rounded-lg bg-slate-200 px-5 py-3 font-semibold text-slate-500"
              >
                Coming Soon
              </button>
            </div>
          ))}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 py-8 text-center text-white">
        <p className="font-semibold">MemberPass</p>
        <p className="mt-2 text-sm text-slate-300">
          Membership made simple.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Internship project for Thendral Yoga Loft.
        </p>
      </footer>

    </main>
  );
}
