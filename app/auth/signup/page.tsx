export const metadata = {
  title: "Sign up | CoinWayFinder",
  description: "Create your CoinWayFinder account and start your journey to smarter crypto trading.",
}

import SignupClient from "./signup-client"

export default function Page() {
  // Server Component rendering a Client Component is the recommended pattern in App Router.
  // Avoid using next/dynamic with ssr: false in Server Components [^2].
  return <SignupClient />
}
