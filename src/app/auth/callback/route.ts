import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding/step-1';

  if (code) {
    // TODO: Exchange code for session with Supabase
    // const supabase = createServerClient();
    // const { error } = await supabase.auth.exchangeCodeForSession(code);
    // if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
