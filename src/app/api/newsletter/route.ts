import { NextResponse } from "next/server";

type NewsletterRequest = {
  email?: unknown;
};

function isValidEmail(email: unknown): email is string {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export async function POST(request: Request) {
  let payload: NewsletterRequest;
  try {
    payload = (await request.json()) as NewsletterRequest;
  } catch (error) {
    console.error("Could not parse a KAMEA newsletter sign-up request.", error);
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!isValidEmail(payload.email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const subscriptionUrl = process.env.NEWSLETTER_SUBSCRIPTION_URL;
  if (!subscriptionUrl) {
    return NextResponse.json(
      {
        message:
          "Newsletter sign-up is not connected yet. Please check back soon.",
      },
      { status: 503 },
    );
  }

  let destination: URL;
  try {
    destination = new URL(subscriptionUrl);
  } catch (error) {
    console.error("KAMEA newsletter endpoint URL is invalid.", error);
    return NextResponse.json(
      { message: "Newsletter sign-up is temporarily unavailable." },
      { status: 503 },
    );
  }

  if (destination.protocol !== "https:") {
    console.error("KAMEA newsletter endpoint must use HTTPS.");
    return NextResponse.json(
      { message: "Newsletter sign-up is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const headers = new Headers({ "Content-Type": "application/json" });
    const token = process.env.NEWSLETTER_SUBSCRIPTION_TOKEN;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const providerResponse = await fetch(destination, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: payload.email.trim() }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      redirect: "error",
    });

    if (!providerResponse.ok) {
      console.error(
        "KAMEA newsletter provider rejected a subscription request.",
        providerResponse.status,
      );
      return NextResponse.json(
        { message: "We could not complete your sign-up. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "You are on the list. Thank you for joining KAMEA.",
    });
  } catch (error) {
    console.error("Could not reach the KAMEA newsletter provider.", error);
    return NextResponse.json(
      { message: "We could not reach the newsletter service. Please try again later." },
      { status: 502 },
    );
  }
}
