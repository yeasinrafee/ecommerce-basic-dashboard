import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api").replace(/\/$/, "");
const FORBIDDEN_FORWARD_HEADERS = new Set([
  "host",
  "cookie",
  "content-length",
  "content-encoding",
  "transfer-encoding",
  "connection",
  "keep-alive"
]);

const buildTargetUrl = (segments: string[] | undefined, incomingUrl: string) => {
  if (!segments || segments.length === 0) {
    throw new Error("Proxy path is required");
  }

  const targetUrl = new URL(`${API_BASE_URL}/${segments.join("/")}`);
  const incoming = new URL(incomingUrl);
  targetUrl.search = incoming.search;
  return targetUrl.toString();
};

const methodAllowsBody = (method: string) => {
  const verb = method.toUpperCase();
  return verb !== "GET" && verb !== "HEAD" && verb !== "OPTIONS";
};

const resolveForwardHeaders = (req: Request, accessToken?: string) => {
  const forwardHeaders = new Headers();

  req.headers.forEach((value, key) => {
    const headerName = key.toLowerCase();

    if (FORBIDDEN_FORWARD_HEADERS.has(headerName)) {
      return;
    }

    if (value) {
      forwardHeaders.append(key, value);
    }
  });

  if (accessToken) {
    forwardHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return forwardHeaders;
};

const sanitizeResponseHeaders = (headers: Headers) => {
  const sanitized = new Headers();

  headers.forEach((value, key) => {
    if (key === "content-length" || key === "transfer-encoding") {
      return;
    }

    sanitized.append(key, value);
  });

  return sanitized;
};

const proxyRequest = async (
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) => {
  try {
    const { path } = await params;
    const targetUrl = buildTargetUrl(path, req.url);
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const headers = resolveForwardHeaders(req, accessToken);
    const body = methodAllowsBody(req.method) ? req.body : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      ...(body ? { duplex: "half" as const } : {}),
      cache: "no-store"
    });

    const responseHeaders = sanitizeResponseHeaders(response.headers);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Proxy error", error);

    if (error instanceof Error && error.message === "Proxy path is required") {
      return NextResponse.json({ message: "Proxy path is required" }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Unable to reach upstream service" },
      { status: 502 }
    );
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;

export const dynamic = "force-dynamic";
