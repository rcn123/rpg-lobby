import { requireEnv } from "@/lib/env";

type UnsplashResponse = {
  urls: {
    small: string;
    regular: string;
    full: string;
  };
};

export async function fetchImages(query: string, count: number): Promise<string[]> {
  const unsplashKey = requireEnv("NEXT_PUBLIC_UNSPLASH_ACCESS_KEY");
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&client_id=${unsplashKey}&count=${count}`
  );

  if (!res.ok) {
    throw new Error("Failed to get image from unsplash");
  }

  const data: UnsplashResponse[] = await res.json();
  return data.map((d) => d.urls.regular as string);
}

