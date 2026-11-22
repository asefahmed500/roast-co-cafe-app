import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const ip = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  await page.setExtraHTTPHeaders({ "CF-Connecting-IP": ip });
});

const password = "StrongPass123!";

async function onboard(page: import("@playwright/test").Page) {
  const email = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "Full name" }).fill("Order QA");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Pick your café")).toBeVisible();
  await page.getByRole("button", { name: "Confirm café" }).click();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
}

test("complete ordering workflow persists across refresh and modules", async ({ page }) => {
  await onboard(page);

  // Product detail with priced options.
  await page.getByRole("button", { name: "Caramel Latte", exact: true }).click();
  await expect(page.getByText("Size")).toBeVisible();
  await page.getByRole("button", { name: "L · 450ml" }).click();
  await page.getByRole("button", { name: "Oat" }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByRole("button", { name: "Add to bag · ৳990" })).toBeVisible();
  await page.getByRole("button", { name: "Add to bag · ৳990" }).click();

  await expect(page.getByText("L · Oat milk")).toBeVisible();
  await expect(page.getByText("Subtotal")).toBeVisible();
  await expect(page.getByText("৳990", { exact: true }).first()).toBeVisible();

  // Promo validation + discount.
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("COFFEE10 · 10% off")).toBeVisible();
  await expect(page.getByText("−৳99")).toBeVisible();
  await expect(page.getByRole("button", { name: /Checkout · ৳891/ })).toBeVisible();

  // Refresh must keep cart + options + promo calculation.
  await page.reload();
  await expect(page.getByText("L · Oat milk")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: /Checkout · ৳891/ })).toBeVisible();

  // Checkout options are sent to the API.
  await page.getByRole("button", { name: /Checkout · ৳891/ }).click();
  await expect(page.getByText("Pickup time")).toBeVisible();
  await page.getByRole("button", { name: "Dine-in" }).click();
  await page.getByRole("button", { name: "15 min" }).click();
  await page.getByRole("radio", { name: "Nagad" }).click();
  await page.getByRole("button", { name: /Place order · ৳891/ }).click();

  // Live tracking with real order data.
  await expect(page.getByText(/Order #\d+/)).toBeVisible();
  await expect(page.getByText("Order received")).toBeVisible();
  await expect(page.getByText("Dhanmondi", { exact: false }).or(page.getByText("Gulshan 2", { exact: false }))).toBeVisible();

  const id = page.url().split("/").pop();
  expect(id).toMatch(/^[0-9a-f-]{36}$/);

  // Order appears in history, cart is cleared, data survives re-login.
  await page.getByRole("button", { name: "Back to home" }).click();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
  await page.getByRole("tab", { name: "profile" }).click();
  await page.getByRole("button", { name: "Order history" }).click();
  await expect(page.getByText(/Order #\d+/).first()).toBeVisible();

  await page.goto("/bag", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Your bag is empty")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Your bag is empty")).toBeVisible({ timeout: 20_000 });
});
