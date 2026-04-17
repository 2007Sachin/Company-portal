import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, user_id } = body;

    if (!username || !user_id) {
      return NextResponse.json(
        { error: 'username and user_id are required' },
        { status: 400 }
      );
    }

    // TODO: Verify LeetCode username exists
    // const leetcodeResponse = await fetch('https://leetcode.com/graphql', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     query: `query { matchedUser(username: "${username}") { username submitStats { acSubmissionNum { difficulty count } } } }`,
    //   }),
    // });
    // const leetcodeData = await leetcodeResponse.json();

    // TODO: Save integration to Supabase
    // TODO: Fetch initial problem-solving data

    return NextResponse.json({
      data: {
        platform: 'leetcode',
        username,
        status: 'connected',
        stats: {
          problems_solved: 284,
          easy: 89,
          medium: 156,
          hard: 39,
          contest_rating: 1680,
        },
      },
      message: 'LeetCode connected successfully',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to verify LeetCode username' }, { status: 500 });
  }
}
