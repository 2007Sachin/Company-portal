import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // TODO: Fetch from Supabase
  const mockProfile = {
    id: '1',
    user_id: userId,
    full_name: 'Rahul Kumar',
    email: 'rahul@example.com',
    professional_headline: 'Full Stack Developer | React & Node.js',
    location: 'Bangalore, India',
    college: 'XYZ Engineering College',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduation_year: 2025,
    target_roles: ['fullstack', 'backend', 'devops'],
    ideal_environment: ['startup', 'remote', 'product'],
    is_public: true,
    onboarding_step: 5,
    onboarding_completed: true,
  };

  return NextResponse.json({ data: mockProfile });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...updates } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // TODO: Update in Supabase
    // const { data, error } = await updateProfile(user_id, updates);

    return NextResponse.json({ data: { user_id, ...updates }, message: 'Profile updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
