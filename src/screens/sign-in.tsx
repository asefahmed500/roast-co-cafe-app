import React, { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { loginSchema } from "../../shared/validation";
import { StatusLine, TopBar, PrimaryButton, TextField, FormMessage, Button } from "@/components/kit";
import { Illustration } from "@/components/illustrations";
import { useAuth } from "@/context/auth";
import { errorMessage } from "@/lib/api";

export function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0] ?? "form", issue.message])));
      return;
    }
    setErrors({});
    setMessage(null);
    setBusy(true);
    try {
      await signIn(parsed.data.email, parsed.data.password);
      router.replace("/choose-cafe");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title="" onBack={() => router.back()} />

      <View className="px-5 mt-4">
        <View className="w-11 h-11 rounded-[15px] bg-caramel items-center justify-center">
          <Illustration name="bean" size={28} />
        </View>
        <Text className="text-[27px] leading-tight font-bold tracking-tight mt-5 text-ink">
          Welcome{"\n"}back
        </Text>
        <Text className="text-[13px] text-muted mt-2">Sign in to order ahead and skip the queue.</Text>

        <View className="mt-7">
          <TextField
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secure
            error={errors.password}
            onSubmitEditing={() => void submit()}
          />
        </View>

        <FormMessage message={message} />
        <PrimaryButton label="Sign in" onPress={() => void submit()} loading={busy} className="mt-5" />

        <View className="flex-row items-center justify-center mt-5 gap-1">
          <Text className="text-[13px] text-muted">New to Roast &amp; Co.?</Text>
          <Button label="Create account" variant="link" size="sm" onPress={() => router.push("/sign-up" as never)} />
        </View>
      </View>

      <Text className="text-[11.5px] text-muted text-center px-6 mt-auto pb-7">
        By continuing you agree to our Terms and Privacy Policy.
      </Text>
    </View>
  );
}
