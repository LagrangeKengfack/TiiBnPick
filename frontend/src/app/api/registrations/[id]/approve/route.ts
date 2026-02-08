import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RegistrationStatus } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
        status: RegistrationStatus.APPROVED
      }
    })

    // Create delivery person account
    await db.deliveryPerson.create({
      data: {
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        location: registration.location,
        vehicleType: registration.vehicleType,
        idCardVerified: registration.idCardVerified,
        vehicleRegVerified: registration.vehicleRegVerified,
        insuranceVerified: registration.insuranceVerified,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    console.error('Error approving registration:', error)
    return NextResponse.json(
      { error: 'Failed to approve registration' },
      { status: 500 }
    )
  }
}
