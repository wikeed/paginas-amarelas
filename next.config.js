/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'books.google.com',
      'covers.openlibrary.org',
      'localhost',
      'images.theconversation.com',
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
