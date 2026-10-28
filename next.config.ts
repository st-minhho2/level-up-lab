import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Each worktree gets its own build dir (scripts/worktree.sh sets NEXT_DIST_DIR) so parallel tasks never
  // overwrite each other's compiled output.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Worktrees live inside the repo root (.worktrees/<slug>), so Next sees two lockfiles and would guess the wrong
  // root. The current checkout is always the root.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
