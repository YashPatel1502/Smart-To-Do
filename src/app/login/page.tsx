"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState<string>("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/tasks";

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const handleSendMagicLink = async (values: EmailFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("email", {
        email: values.email,
        redirect: false,
        callbackUrl,
      });
      
      // Check if there was an error
      if (result?.error) {
        console.error("[login] SignIn error:", result.error);
        toast.error(
          result.error === "Configuration"
            ? "Server configuration error. Please check your environment variables."
            : "Failed to send magic link. Please try again."
        );
        return;
      }
      
      setEmailSent(true);
      setSentEmail(values.email);
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      console.error("[login] Magic link error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(
        errorMessage.includes("database") || errorMessage.includes("connection")
          ? "Database connection error. Please check your database settings."
          : "Failed to send magic link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a magic link to <strong>{sentEmail}</strong>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Click the link in the email to sign in. The link will expire in 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                form.reset();
              }}
            >
              Use a different email
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Smart To-Do</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive a magic link
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSendMagicLink)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-pulse" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send magic link
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            No password needed! We'll send you a secure link to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

