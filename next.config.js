/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // Optional: Add trailingSlash for better static hosting compatibility
    trailingSlash: true,
    // Change the output directory to 'build'
    // distDir: 'build'
}

module.exports = nextConfig 