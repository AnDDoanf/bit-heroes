function resolveBasePath() {
  if (process.env.BASE_PATH) {
    return process.env.BASE_PATH;
  }

  const repository = process.env.GITHUB_REPOSITORY || "";
  const repositoryName = repository.split("/")[1] || "";

  if (process.env.GITHUB_ACTIONS === "true" && repositoryName) {
    return `/${repositoryName}`;
  }

  return "";
}

const basePath = resolveBasePath();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
