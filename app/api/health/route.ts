import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '../../../config/environment'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      database: isSupabaseConfigured() ? 'connected' : 'demo-mode',
      application: 'running',
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  }

  return NextResponse.json(health, { status: 200 })
}

// Allow CORS for health checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    },
  })
}