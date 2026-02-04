import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const registrations = await db.registrationRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
