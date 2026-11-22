import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { registerSchema } from "../../shared/validation";
import { StatusLine, TopBar, PrimaryButton, TextField, FormMessage, Button } from "@/components/kit";
import { useAuth } from "@/context/auth";
import { errorMessage } from "@/lib/api";

export function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0] ?? "form", issue.message])));
      return;
    }
    setErrors({});
    setMessage(null);
    setBusy(true);
    try {
      await signUp(parsed.data.name, parsed.data.email, parsed.data.password);
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
      <TopBar title="Create account" onBack={() => router.back()} />

      <View className="px-5 mt-5">
        <Text className="text-[27px] leading-tight font-bold tracking-tight text-ink">
          Join the club
        </Text>
        <Text className="text-[13px] text-muted mt-2">A little ritual, made a lot easier.</Text>

        <View className="mt-7">
          <TextField label="Full name" value={name} onChangeText={setName} placeholder="Maya Rahman" autoCapitalize="words" error={errors.name} />
          <TextField label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" error={errors.email} />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secure error={errors.password} onSubmitEditing={() => void submit()} />
        </View>

        <FormMessage message={message} />
        <PrimaryButton label="Create account" onPress={() => void submit()} loading={busy} className="mt-5" />

        <View className="flex-row items-center justify-center mt-5 gap-1">
          <Text className="text-[13px] text-muted">Already have an account?</Text>
          <Button label="Sign in" variant="link" size="sm" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}
