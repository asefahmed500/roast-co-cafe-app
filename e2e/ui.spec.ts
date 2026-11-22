import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const ip = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  await page.setExtraHTTPHeaders({ "CF-Connecting-IP": ip });
});

const password = "StrongPass123!";

async function onboard(page: import("@playwright/test").Page) {
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "Full name" }).fill("UI QA");
  await page.getByRole("textbox", { name: "Email address" }).fill(`ui-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Pick your café")).toBeVisible();
}

test("café selection and search work end to end", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: "search" }).click();
  await page.getByRole("textbox", { name: "Search cafés" }).fill("Dhanmondi");
  await expect(page.getByRole("radio", { name: /Dhanmondi/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Gulshan/ })).toHaveCount(0);
  await page.getByRole("radio", { name: /Dhanmondi/ }).click();
  await page.getByRole("button", { name: "Confirm café" }).click();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
});

test("menu filters, search, and empty state work", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: "Confirm café" }).click();
  await page.getByRole("tab", { name: "menu" }).click();

  await page.getByRole("button", { name: "Cold", exact: true }).click();
  await expect(page.getByRole("button", { name: "Iced Americano", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Caramel Latte", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "search" }).click();
  await page.getByRole("textbox", { name: "Search the menu" }).fill("nothing-matches");
  await expect(page.getByText("No matches")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByRole("button", { name: "Caramel Latte", exact: true })).toBeVisible();
});

test("home notification toggle and see-all action work", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: "Confirm café" }).click();
  await page.getByRole("button", { name: "bell" }).click();
  await expect(page.getByText("Order updates", { exact: true })).toBeVisible();
  await expect(page.getByText(/No order updates yet|Order #\d+/)).toBeVisible();
  await page.getByRole("button", { name: "bell" }).click();
  await expect(page.getByText("Order updates", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "See all" }).click();
  await expect(page.getByText("Hot coffee")).toBeVisible();
});

test("favourites persist across navigation", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: "Confirm café" }).click();
  await page.getByRole("button", { name: "Caramel Latte", exact: true }).click();
  await page.getByRole("button", { name: "heart" }).click();
  await page.getByRole("button", { name: "back" }).click();
  await page.getByRole("tab", { name: "profile" }).click();
  await page.getByRole("button", { name: "Favourites" }).click();
  await expect(page.getByRole("button", { name: "Caramel Latte", exact: true })).toBeVisible();
});

test("button loading and disabled states are exposed", async ({ page }) => {
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  const submit = page.getByRole("button", { name: "Sign in" });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();

  await page.getByRole("textbox", { name: "Email address" }).fill("nobody@example.com");
  await page.getByRole("textbox", { name: "Password" }).fill("WrongPass123!");
  // Slow the real request so the busy state can be asserted deterministically.
  await page.route("**/api/auth/login", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.continue();
  });
  await submit.click();
  await expect(submit).toHaveAttribute("aria-busy", "true");
  await expect(submit).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText("Email or password is incorrect")).toBeVisible();
});
