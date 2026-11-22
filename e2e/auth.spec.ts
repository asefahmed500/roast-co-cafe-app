import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const ip = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  await page.setExtraHTTPHeaders({ "CF-Connecting-IP": ip });
});

const password = "StrongPass123!";
const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

async function signUp(page: import("@playwright/test").Page, email: string, name = "QA Tester") {
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "Full name" }).fill(name);
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Pick your café")).toBeVisible();
}

test("registration validates fields and rejects duplicates", async ({ page }) => {
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter your name")).toBeVisible();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();

  const email = uniqueEmail();
  await signUp(page, email);
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "Full name" }).fill("Duplicate");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("An account with this email already exists")).toBeVisible();
});

test("login rejects bad credentials, accepts good ones, and persists the session", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "profile" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("Welcome")).toBeVisible();

  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("WrongPass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Email or password is incorrect")).toBeVisible();

  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Pick your café")).toBeVisible();

  // Reload keeps the current protected route and restores the session.
  await page.reload();
  await expect(page.getByText("Pick your café")).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => localStorage.getItem("roastco.session"))).toBeTruthy();
});

test("cart and promo state do not leak between accounts", async ({ page }) => {
  await signUp(page, uniqueEmail(), "User A");
  await page.getByRole("button", { name: "Confirm café" }).click();
  await page.getByRole("button", { name: "Add Caramel Latte" }).click();
  await expect(page.getByText("Caramel Latte").first()).toBeVisible();
  await page.getByRole("tab", { name: "profile" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();

  await signUp(page, uniqueEmail(), "User B");
  await page.getByRole("button", { name: "Confirm café" }).click();
  await page.getByRole("tab", { name: "bag" }).click();
  await expect(page.getByText("Your bag is empty")).toBeVisible();
});

test("protected routes redirect when signed out", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/bag", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/order/any-id", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/sign-in$/);
});
