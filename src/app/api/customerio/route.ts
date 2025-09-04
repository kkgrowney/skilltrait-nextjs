import { NextRequest, NextResponse } from 'next/server';
import { customerIO, CustomerData } from '@/lib/customerio';

export async function PUT(request: NextRequest) {
  try {
    const { email, data } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Data object is required' },
        { status: 400 }
      );
    }

    // Update customer in Customer.io
    const result = await customerIO.updateCustomer(email, data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Customer.io API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, eventName, eventData } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Track event in Customer.io
    const result = await customerIO.trackEvent(email, eventName, eventData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Customer.io Event Tracking Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
