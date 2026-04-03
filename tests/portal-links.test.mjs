import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("entry pages do not use dead hash links", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/auth/login/page.tsx",
    "src/app/auth/signup/page.tsx",
  ];

  for (const file of files) {
    const content = read(file);
    assert.equal(
      content.includes('href="#"'),
      false,
      `${file} still contains dead href=\"#\" links`
    );
  }
});

test("legal and account portal routes exist", () => {
  const routes = [
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/auth/forgot-password/page.tsx",
  ];

  for (const routeFile of routes) {
    assert.equal(
      fs.existsSync(path.join(projectRoot, routeFile)),
      true,
      `${routeFile} is missing`
    );
  }
});

test("entry pages point to real portal routes", () => {
  const home = read("src/app/page.tsx");
  const login = read("src/app/auth/login/page.tsx");
  const signup = read("src/app/auth/signup/page.tsx");

  assert.equal(home.includes('href="/privacy"'), true, "Home page should link to /privacy");
  assert.equal(home.includes('href="/terms"'), true, "Home page should link to /terms");
  assert.equal(
    login.includes('href="/auth/forgot-password"'),
    true,
    "Login page should link to /auth/forgot-password"
  );
  assert.equal(signup.includes('href="/terms"'), true, "Signup page should link to /terms");
  assert.equal(signup.includes('href="/privacy"'), true, "Signup page should link to /privacy");
});
