import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hladstat",
    short_name: "Hladstat",
    description:
      "Hladstat to aplikacja ułatwiająca prowadzenie statystyk siatkarskich",
    start_url: "/dashboard",
    background_color: "#0a0a0a",
    theme_color: "#fafafa",
    display: "standalone",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
