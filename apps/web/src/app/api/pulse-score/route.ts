import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // TODO: Calculate from real integration data
  const mockScore = {
    id: '1',
    user_id: userId,
    overall_score: 72,
    velocity_score: 78,
    consistency_score: 65,
    breadth_score: 70,
    impact_score: 58,
    trend: 'rising',
    percentile: 75,
    calculated_at: new Date().toISOString(),
    breakdown: {
      github: {
        commits_30d: 127,
        prs_merged_30d: 8,
        repos_contributed: 5,
        languages: ['TypeScript', 'Python', 'Go', 'JavaScript', 'CSS'],
        streak_days: 15,
      },
      leetcode: {
        problems_solved: 284,
        easy: 89,
        medium: 156,
        hard: 39,
        contest_rating: 1680,
        streak_days: 12,
      },
      medium: {
        articles_published: 12,
        total_claps: 2400,
        followers: 156,
      },
    },
  };

  return NextResponse.json({ data: mockScore });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // TODO: Trigger score recalculation
    // 1. Fetch latest data from all integrations
    // 2. Apply scoring algorithm (velocity, consistency, breadth, impact)
    // 3. Apply anti-gaming checks (time decay, daily caps, anomaly detection)
    // 4. Save to database

    return NextResponse.json({
      data: { user_id, status: 'recalculating' },
      message: 'Pulse Score recalculation triggered',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
