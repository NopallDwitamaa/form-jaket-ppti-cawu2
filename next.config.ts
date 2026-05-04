const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ontpsotsineqcquaavhq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;