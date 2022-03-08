import { config } from 'dotenv';
config();


export function getGitHubUrl() {
  return process.env.GITHUB_ENTERPRISE_SERVER_URL || 'https://api.github.com';
}

export function getGitHubAccessToken() {
  const token = process.env.GITHUB_ACCESS_TOKEN;

  if (!token) {
    throw new Error(`A GitHub Access Token (PAT), has not been provided, please specify one in the environment variable 'GITHUB_ACCESS_TOKEN'`);
  }
  return token;
}