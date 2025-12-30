import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["Track up to 5 products", "Email notifications", "24-hour price checks", "Basic price history"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€5",
    period: "per month",
    description: "For serious deal hunters",
    features: [
      "Track up to 50 products",
      "Email + SMS notifications",
      "5-minute price checks",
      "Full price history",
      "Priority support",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Ultra",
    price: "€10",
    period: "per month",
    description: "Maximum power for power users",
    features: [
      "Unlimited product tracking",
      "All notification channels",
      "30-second price checks",
      "API access",
      "Auto-checkout integration",
      "Dedicated support",
    ],
    cta: "Go Ultra",
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you need more power.</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted ? "border-accent bg-accent/5" : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-accent" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${
                  plan.highlighted
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
