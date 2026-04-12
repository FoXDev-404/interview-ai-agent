"use client";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "@/components/FormField";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function SignInForm({
  onForgotPassword,
}: {
  onForgotPassword: () => void;
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const cred = await signInWithEmailAndPassword(auth, values.email, values.password);

      if (!cred.user.emailVerified) {
        await sendEmailVerification(cred.user);
        toast.error("Please verify your email first.");
        return;
      }

      const token = await cred.user.getIdToken();
      const res = await signIn({ email: values.email, idToken: token });

      if (!res.success) {
        const name =
          localStorage.getItem(`pendingUser_${cred.user.uid}`) ||
          cred.user.displayName ||
          "User";

        await signUp({ uid: cred.user.uid, name, email: values.email });
        await signIn({ email: values.email, idToken: token });
      }

      toast.success("Signed in successfully!");
      window.location.href = "/";
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed";
      toast.error(errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5 form">
        <FormField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
        />
        <FormField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <div className="flex justify-end -mt-2">
          <button
            type="button"
            onClick={onForgotPassword}
            suppressHydrationWarning
            className="text-xs text-primary-200 hover:text-primary-100 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <button type="submit" suppressHydrationWarning className="auth-submit-btn">
          Sign In
        </button>
      </form>
    </Form>
  );
}
