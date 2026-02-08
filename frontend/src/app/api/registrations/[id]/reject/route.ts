import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RegistrationStatus } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    // Get the registration request
    const registration = await db.registrationRequest.findUnique({
      where: { id }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Update registration status
    const updatedRegistration = await db.registrationRequest.update({
      where: { id },
      data: {
        status: RegistrationStatus.REJECTED,
        rejectionReason: reason || 'Demande rejetée par l\'administrateur'
      }
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    console.error('Error rejecting registration:', error)
    return NextResponse.json(
      { error: 'Failed to reject registration' },
      { status: 500 }
    )
  }
}
