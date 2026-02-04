import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AccountStatus } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if account exists
    const account = await db.account.findUnique({
      where: { id }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Update account status to revoked
    const updatedAccount = await db.account.update({
      where: { id },
      data: {
        status: AccountStatus.REVOKED
      }
    })

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error('Error revoking account:', error)
    return NextResponse.json(
      { error: 'Failed to revoke account' },
      { status: 500 }
    )
  }
}
