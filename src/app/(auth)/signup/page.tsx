import Link from 'next/link'
import { SignupForm } from './SignupForm'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error as string | undefined;
  const message = resolvedSearchParams?.message as string | undefined;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-card/80 backdrop-blur-xl p-8 shadow-xl border border-border/50">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Join Team Task Manager today
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-primary/10 p-4 border border-primary/20">
            <p className="text-sm text-primary">{message}</p>
          </div>
        )}

        <SignupForm />
        
        <p className="text-center text-sm text-foreground/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
