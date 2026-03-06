const envUrl = process.env.NEXT_PUBLIC_API_URL;

if (!envUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is required. Add it to your .env (project root) and restart the Next.js dev server.'
  );
}

export const baseUrl: string = envUrl+"/api";
export default baseUrl;


