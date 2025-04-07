/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  },
}

module.exports = nextConfig