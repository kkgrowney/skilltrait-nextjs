import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    hasApiKey: !!process.env.CUSTOMER_IO_API_KEY,
    hasSiteId: !!process.env.CUSTOMER_IO_SITE_ID,
    apiKeyLength: process.env.CUSTOMER_IO_API_KEY?.length || 0,
    siteIdLength: process.env.CUSTOMER_IO_SITE_ID?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('CUSTOMER'))
  };

  return NextResponse.json(envCheck);
}
