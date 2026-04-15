export default function AuthHeader({ type }: { type?: string }) {
  const isSignIn = type === "sign-in";

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {isSignIn ? "Welcome back" : "Create your account"}
      </h2>
      <p className="text-sm text-light-400">
        {isSignIn
          ? "Sign in to continue your interview prep journey."
          : "Start practicing for your dream job interviews."}
      </p>
    </div>
  );
}
