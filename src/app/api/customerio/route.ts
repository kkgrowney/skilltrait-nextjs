import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from 'next/server';
import { customerIO, CustomerData } from '@/lib/customerio';
import {
  admitRequest,
  readJsonBody,
  requireFirebaseUser,
} from '@/lib/server/apiSecurity';

type CustomerUpdateBody = { email?: string; data?: CustomerData };
type CustomerEventBody = {
  email?: string;
  eventName?: string;
  eventData?: Record<string, unknown>;
};

async function authorizeCustomerRequest(request: NextRequest) {
  const admission = admitRequest(request, {
    route: 'customerio',
    maxRequests: 30,
    windowMs: 60_000,
    maxConcurrent: 5,
    maxBodyBytes: 32 * 1024,
  });
  if (admission instanceof NextResponse) return admission;
  const user = await requireFirebaseUser(request);
  if (user instanceof NextResponse) {
    admission.release();
    return user;
  }
  return { admission, user };
}

export async function PUT(request: NextRequest) {
  const authorization = await authorizeCustomerRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  try {
    const body = await readJsonBody<CustomerUpdateBody>(request, 32 * 1024);
    if (body instanceof NextResponse) return body;
    const { email, data } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!authorization.user.email || authorization.user.email !== email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    logger.error('Customer.io customer update failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    authorization.admission.release();
  }
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeCustomerRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  try {
    const body = await readJsonBody<CustomerEventBody>(request, 32 * 1024);
    if (body instanceof NextResponse) return body;
    const { email, eventName, eventData } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!authorization.user.email || authorization.user.email !== email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_.:-]{1,80}$/.test(eventName)) {
      return NextResponse.json({ error: 'Invalid event name' }, { status: 400 });
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
    logger.error('Customer.io event tracking failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    authorization.admission.release();
  }
}
