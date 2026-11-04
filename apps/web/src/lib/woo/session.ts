import { cookies } from "next/headers";

export const CART_TOKEN_COOKIE = "jt_cart_token";
export const NONCE_COOKIE = "jt_store_nonce";
export const AUTH_COOKIE = "jt_customer_token";

export async function getStoreSession() {
  const jar = await cookies();
  return {
    cartToken: jar.get(CART_TOKEN_COOKIE)?.value,
    nonce: jar.get(NONCE_COOKIE)?.value,
    auth: jar.get(AUTH_COOKIE)?.value,
  };
}

export async function persistStoreSession(session: {
  cartToken?: string;
  nonce?: string;
}) {
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  if (session.cartToken) {
    jar.set(CART_TOKEN_COOKIE, session.cartToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  if (session.nonce) {
    jar.set(NONCE_COOKIE, session.nonce, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
}
