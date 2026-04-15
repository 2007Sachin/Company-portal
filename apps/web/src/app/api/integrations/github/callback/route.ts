import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
  }

  try {
    // TODO: Exchange code for access token with GitHub
    // const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    //   body: JSON.stringify({
    //     client_id: process.env.GITHUB_CLIENT_ID,
    //     client_secret: process.env.GITHUB_CLIENT_SECRET,
    //     code,
    //   }),
    // });
    // const { access_token } = await tokenResponse.json();

    // TODO: Fetch GitHub user profile
    // const userResponse = await fetch('https://api.github.com/user', {
    //   headers: { Authorization: `Bearer ${access_token}` },
    // });
    // const githubUser = await userResponse.json();

    // TODO: Save integration to Supabase
    // TODO: Trigger initial data sync (commits, PRs, repos)

    // Redirect back to onboarding
    return NextResponse.redirect(new URL('/onboarding/step-2?github=connected', request.url));
  } catch {
    return NextResponse.redirect(new URL('/onboarding/step-2?github=error', request.url));
  }
}
