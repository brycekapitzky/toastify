import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    console.log('Authorization error:', error);
    return c.json({ error: 'Invalid authorization token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Routes

// Sign up new user
app.post('/make-server-18cd52d5/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user settings
    await kv.set(`user_settings:${data.user.id}`, {
      autoSend: false,
      quietHours: true,
      timezone: 'America/New_York',
      minDaysBetween: 3,
      maxDaysBetween: 5,
      openPoints: 1,
      clickPoints: 1,
      replyPoints: 3,
      decayDays: 10,
      decayAmount: 1
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get all prospects for a user
app.get('/make-server-18cd52d5/prospects', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const prospects = await kv.getByPrefix(`prospect:${userId}:`);
    
    return c.json({ prospects: prospects || [] });
  } catch (error) {
    console.log('Error fetching prospects:', error);
    return c.json({ error: 'Failed to fetch prospects' }, 500);
  }
});

// Create new prospect
app.post('/make-server-18cd52d5/prospects', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const prospectData = await c.req.json();
    
    const prospect = {
      ...prospectData,
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
      group: 0,
      status: 'active',
      timeline: [{
        id: crypto.randomUUID(),
        type: 'note_added',
        date: new Date().toISOString(),
        description: 'Prospect added to system'
      }]
    };

    await kv.set(`prospect:${userId}:${prospect.id}`, prospect);
    
    return c.json({ prospect });
  } catch (error) {
    console.log('Error creating prospect:', error);
    return c.json({ error: 'Failed to create prospect' }, 500);
  }
});

// Update prospect
app.put('/make-server-18cd52d5/prospects/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const prospectId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingProspect = await kv.get(`prospect:${userId}:${prospectId}`);
    if (!existingProspect) {
      return c.json({ error: 'Prospect not found' }, 404);
    }

    const updatedProspect = {
      ...existingProspect,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`prospect:${userId}:${prospectId}`, updatedProspect);
    
    return c.json({ prospect: updatedProspect });
  } catch (error) {
    console.log('Error updating prospect:', error);
    return c.json({ error: 'Failed to update prospect' }, 500);
  }
});

// Add engagement event
app.post('/make-server-18cd52d5/prospects/:id/engagement', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const prospectId = c.req.param('id');
    const { type, description, metadata } = await c.req.json();
    
    const prospect = await kv.get(`prospect:${userId}:${prospectId}`);
    if (!prospect) {
      return c.json({ error: 'Prospect not found' }, 404);
    }

    // Calculate score change
    let scoreChange = 0;
    switch (type) {
      case 'email_opened': scoreChange = 1; break;
      case 'email_clicked': scoreChange = 1; break;
      case 'email_replied': scoreChange = 3; break;
      case 'bounced': scoreChange = -999; break; // Remove from system
    }

    const newScore = Math.max(0, Math.min(5, prospect.score + scoreChange));
    const newGroup = newScore;
    let newStatus = prospect.status;

    // Handle special cases
    if (type === 'bounced') {
      newStatus = 'bounced';
    } else if (newScore >= 5) {
      newStatus = 'handoff';
    } else if (newScore === 0 && scoreChange < 0) {
      newStatus = 'cold';
    }

    // Create engagement event
    const event = {
      id: crypto.randomUUID(),
      type,
      date: new Date().toISOString(),
      description,
      metadata
    };

    const updatedProspect = {
      ...prospect,
      score: newScore,
      group: newGroup,
      status: newStatus,
      lastEngagement: new Date().toISOString(),
      timeline: [...(prospect.timeline || []), event],
      updatedAt: new Date().toISOString()
    };

    await kv.set(`prospect:${userId}:${prospectId}`, updatedProspect);
    
    return c.json({ 
      prospect: updatedProspect,
      scoreChange,
      event
    });
  } catch (error) {
    console.log('Error adding engagement:', error);
    return c.json({ error: 'Failed to add engagement' }, 500);
  }
});

// Get user settings
app.get('/make-server-18cd52d5/settings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const settings = await kv.get(`user_settings:${userId}`) || {
      autoSend: false,
      quietHours: true,
      timezone: 'America/New_York',
      minDaysBetween: 3,
      maxDaysBetween: 5,
      openPoints: 1,
      clickPoints: 1,
      replyPoints: 3,
      decayDays: 10,
      decayAmount: 1
    };
    
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update user settings
app.put('/make-server-18cd52d5/settings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const newSettings = await c.req.json();
    
    await kv.set(`user_settings:${userId}`, newSettings);
    
    return c.json({ settings: newSettings });
  } catch (error) {
    console.log('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// Webhook endpoint for Instantly API
app.post('/make-server-18cd52d5/webhook/instantly', async (c) => {
  try {
    const { event_type, email, prospect_email, timestamp, metadata } = await c.req.json();
    
    // Find prospect by email across all users
    const allProspects = await kv.getByPrefix('prospect:');
    const prospect = allProspects.find(p => p.email === prospect_email);
    
    if (!prospect) {
      console.log('Prospect not found for webhook event:', prospect_email);
      return c.json({ message: 'Prospect not found' }, 404);
    }

    // Map Instantly events to our engagement types
    const eventTypeMap = {
      'email_sent': 'email_sent',
      'email_opened': 'email_opened',
      'email_clicked': 'email_clicked',
      'email_replied': 'email_replied',
      'email_bounced': 'bounced'
    };

    const engagementType = eventTypeMap[event_type];
    if (!engagementType) {
      return c.json({ message: 'Unknown event type' }, 400);
    }

    // Add engagement event (this will automatically update scoring)
    const event = {
      id: crypto.randomUUID(),
      type: engagementType,
      date: new Date(timestamp).toISOString(),
      description: `${event_type.replace('_', ' ')} - automated via Instantly`,
      metadata: { ...metadata, source: 'instantly_webhook' }
    };

    // Calculate score change and update prospect
    let scoreChange = 0;
    switch (engagementType) {
      case 'email_opened': scoreChange = 1; break;
      case 'email_clicked': scoreChange = 1; break;
      case 'email_replied': scoreChange = 3; break;
      case 'bounced': scoreChange = -999; break;
    }

    const newScore = Math.max(0, Math.min(5, prospect.score + scoreChange));
    const newGroup = newScore;
    let newStatus = prospect.status;

    if (engagementType === 'bounced') {
      newStatus = 'bounced';
    } else if (newScore >= 5) {
      newStatus = 'handoff';
    } else if (newScore === 0 && scoreChange < 0) {
      newStatus = 'cold';
    }

    const updatedProspect = {
      ...prospect,
      score: newScore,
      group: newGroup,
      status: newStatus,
      lastEngagement: new Date(timestamp).toISOString(),
      timeline: [...(prospect.timeline || []), event],
      updatedAt: new Date().toISOString()
    };

    await kv.set(`prospect:${prospect.userId}:${prospect.id}`, updatedProspect);

    console.log('Webhook processed:', { event_type, prospect_email, scoreChange, newScore });
    
    return c.json({ 
      message: 'Webhook processed successfully',
      scoreChange,
      newScore,
      newStatus
    });
  } catch (error) {
    console.log('Webhook processing error:', error);
    return c.json({ error: 'Failed to process webhook' }, 500);
  }
});

// Bulk import prospects
app.post('/make-server-18cd52d5/prospects/import', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { prospects } = await c.req.json();
    
    const importedProspects = [];
    
    for (const prospectData of prospects) {
      const prospect = {
        ...prospectData,
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 0,
        group: 0,
        status: 'active',
        timeline: [{
          id: crypto.randomUUID(),
          type: 'note_added',
          date: new Date().toISOString(),
          description: 'Prospect imported via CSV/API'
        }]
      };

      await kv.set(`prospect:${userId}:${prospect.id}`, prospect);
      importedProspects.push(prospect);
    }
    
    return c.json({ 
      message: `Successfully imported ${importedProspects.length} prospects`,
      prospects: importedProspects 
    });
  } catch (error) {
    console.log('Error importing prospects:', error);
    return c.json({ error: 'Failed to import prospects' }, 500);
  }
});

// Get analytics data
app.get('/make-server-18cd52d5/analytics', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const prospects = await kv.getByPrefix(`prospect:${userId}:`);
    
    // Calculate analytics
    const analytics = {
      totalProspects: prospects.length,
      activeProspects: prospects.filter(p => p.status === 'active').length,
      handoffProspects: prospects.filter(p => p.group === 5).length,
      coldProspects: prospects.filter(p => p.status === 'cold').length,
      bouncedProspects: prospects.filter(p => p.status === 'bounced').length,
      groupDistribution: {
        group0: prospects.filter(p => p.group === 0 && p.status !== 'cold').length,
        group1: prospects.filter(p => p.group === 1).length,
        group2: prospects.filter(p => p.group === 2).length,
        group3: prospects.filter(p => p.group === 3).length,
        group4: prospects.filter(p => p.group === 4).length,
        group5: prospects.filter(p => p.group === 5).length
      },
      conversionRate: prospects.length > 0 ? 
        Math.round((prospects.filter(p => p.group === 5).length / prospects.length) * 100) : 0
    };
    
    return c.json({ analytics });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Score decay job (would be called by a cron job)
app.post('/make-server-18cd52d5/jobs/score-decay', async (c) => {
  try {
    const allProspects = await kv.getByPrefix('prospect:');
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    
    for (const prospect of allProspects) {
      if (prospect.status !== 'active') continue;
      
      const lastEngagement = prospect.lastEngagement ? 
        new Date(prospect.lastEngagement) : new Date(prospect.createdAt);
      
      if (lastEngagement < tenDaysAgo && prospect.score > 0) {
        const newScore = Math.max(0, prospect.score - 1);
        const newGroup = newScore;
        let newStatus = prospect.status;
        
        if (newScore === 0) {
          newStatus = 'cold';
        }
        
        const event = {
          id: crypto.randomUUID(),
          type: 'score_changed',
          date: now.toISOString(),
          description: 'Score decreased due to no engagement for 10 days'
        };
        
        const updatedProspect = {
          ...prospect,
          score: newScore,
          group: newGroup,
          status: newStatus,
          timeline: [...(prospect.timeline || []), event],
          updatedAt: now.toISOString()
        };
        
        await kv.set(`prospect:${prospect.userId}:${prospect.id}`, updatedProspect);
      }
    }
    
    return c.json({ message: 'Score decay job completed' });
  } catch (error) {
    console.log('Score decay job error:', error);
    return c.json({ error: 'Score decay job failed' }, 500);
  }
});

Deno.serve(app.fetch);