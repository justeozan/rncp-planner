import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <main className="container grow justify-center p-4 md:p-12 lg:p-24">
      <Card className="w-full bg-card/5 backdrop-blur-sm">
        <CardContent className="p-0 md:p-6">
          <article className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
            <h1>Privacy Policy</h1>

            <p>
              RNCP planner has no accounts and no sign-in. It does not ask for,
              collect or store any personal data, and it does not connect to the
              42 API on your behalf.
            </p>

            <h2>What is collected</h2>
            <p>
              The site uses Vercel Analytics and Vercel Speed Insights to
              measure anonymous page views and performance. These metrics are
              not tied to an identity. Nothing else is recorded.
            </p>

            <h2>Your inputs</h2>
            <p>
              Whatever you enter in the calculator, the RNCP page or the planner
              stays in your browser and is never sent to a database.
            </p>

            <h2>Open source</h2>
            <p>
              RNCP planner is a fork of{" "}
              <a href="https://github.com/lucas-ht/42calculator">
                42calculator
              </a>{" "}
              by lucas-ht, released under the GPL-3.0 license. The source code
              is available on{" "}
              <a href="https://github.com/justeozan/rncp-planner">GitHub</a>.
            </p>
          </article>
        </CardContent>
      </Card>
    </main>
  );
}
