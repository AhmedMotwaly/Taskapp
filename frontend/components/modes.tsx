import { Crosshair, PackageSearch } from "lucide-react"

const modes = [
  {
    icon: Crosshair,
    title: "Deal Sniper",
    description: "Set your target price and we'll notify you instantly when it drops. Never miss a deal again.",
    features: ["Custom price thresholds", "Multi-store tracking", "Price history charts"],
  },
  {
    icon: PackageSearch,
    title: "Restock Sniper",
    description: "Get notified the moment sold-out items are back in stock. Be first in line, every time.",
    features: ["Instant restock alerts", "Multiple variant tracking", "Auto-checkout ready"],
  },
]

export default function Modes() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Two powerful modes</h2>
          <p className="mt-4 text-lg text-muted-foreground">Choose your strategy. We handle the rest.</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
          {modes.map((mode) => (
            <div
              key={mode.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-muted-foreground/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <mode.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{mode.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{mode.description}</p>
              <ul className="mt-6 space-y-3">
                {mode.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
