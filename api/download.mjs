// /download/<platform> → the newest unengine release that carries a build for that platform.
// Each platform is released on its own, so GitHub's /releases/latest may not have it: walk the
// recent releases instead. The CDN caches the redirect, so GitHub is asked only every few minutes,
// and nothing about the visitor is sent to GitHub.
const REPO = 'sealsbroken/unengine';
const ASSETS = {
  android: /-android\.apk$/,
  macos: /-macos-arm64[^/]*\.zip$/,
  windows: /-windows-x64[^/]*\.zip$/
};
const FALLBACK = `https://github.com/${REPO}/releases`;

const redirect = (location, maxAge) => new Response(null, {
  status: 302,
  headers: { Location: location, 'Cache-Control': `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=86400` }
});

export async function GET(request) {
  const platform = new URL(request.url).searchParams.get('platform');
  const pattern = ASSETS[platform];
  if (!pattern) return new Response('Unknown platform', { status: 404 });
  try {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'sealsbroken.com' };
    // Optional: a token only raises GitHub's rate limit; public releases need none.
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    for (const release of await res.json()) {
      if (release.draft || release.prerelease) continue;
      const asset = release.assets.find(a => pattern.test(a.name));
      if (asset) return redirect(asset.browser_download_url, 300);
    }
  } catch (e) {
    console.error(e);
  }
  // GitHub unreachable or no build yet: the releases page, cached briefly.
  return redirect(FALLBACK, 60);
}
