import { Bell, BarChart3, Globe, Zap, Lock, Smartphone } from "lucide-react"

const features = [
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified via email, SMS, or push notification within seconds of a price drop or restock.",
  },
  {
    icon: BarChart3,
    title: "Price Analytics",
    description: "View detailed price history charts and trends to make informed buying decisions.",
  },
  {
    icon: Globe,
    title: "Multi-Store Support",
    description: "Track products across hundreds of retailers worldwide from a single dashboard.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Our monitors check stock and prices every 30 seconds so you never miss an opportunity.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and we never share your tracking history with third parties.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Full-featured mobile app for iOS and Android. Track on the go.",
  },
]

export default function Features() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need to win</h2>
          <p className="mt-4 text-lg text-muted-foreground">Powerful features designed to give you the edge.</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
