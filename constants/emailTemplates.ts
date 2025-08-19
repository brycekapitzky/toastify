export interface EmailStage {
  id: string;
  name: string;
  sequence: number;
  delay: number;
  subject: string;
  template: string;
  isActive: boolean;
  createdAt: string;
}

export const createDefaultEmailStages = (companyDomain: string): EmailStage[] => [
  {
    id: "stage-1",
    name: "Initial Outreach",
    sequence: 1,
    delay: 0,
    subject: `Quick question about ${companyDomain}`,
    template: `Hi {{firstName}},

I hope this email finds you well. I came across {{company}} and was impressed by your work in the industry.

I wanted to reach out because I believe there might be a valuable opportunity for us to connect. We specialize in helping companies like {{company}} streamline their operations and increase efficiency.

Would you be open to a brief conversation to explore how we might be able to help {{company}} achieve its goals?

Best regards,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-2",
    name: "Follow-up",
    sequence: 2,
    delay: 4,
    subject: "Following up on my previous email",
    template: `Hi {{firstName}},

I wanted to follow up on my previous email about {{company}}. I understand you're busy, but I believe this could be valuable for your business.

I'd love to show you how we've helped similar companies in your industry achieve:
• 35% increase in operational efficiency
• 20% reduction in overhead costs
• Faster time-to-market for new initiatives

Would you have 15 minutes this week for a brief call?

Best regards,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-3",
    name: "Value Proposition",
    sequence: 3,
    delay: 9,
    subject: "Custom solution for {{company}}",
    template: `Hi {{firstName}},

I hope you're doing well. I've been thinking about {{company}} and wanted to share something that might be relevant to your current challenges.

Based on what I know about your industry, I've put together a brief overview of how we could help {{company}}:

✓ Streamlined processes that save time
✓ Scalable solutions that grow with your business
✓ Proven ROI from similar implementations

I'd be happy to customize this further based on {{company}}'s specific needs. When would be a good time for a 15-minute conversation?

Looking forward to connecting,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-4",
    name: "Social Proof",
    sequence: 4,
    delay: 15,
    subject: "How [Similar Company] achieved 40% growth",
    template: `Hi {{firstName}},

I wanted to share a quick success story that might resonate with your situation at {{company}}.

We recently worked with a company very similar to {{company}} that was facing challenges with efficiency and growth. Here's what we achieved together:

📈 Results in 6 months:
• 40% increase in productivity
• 25% cost reduction
• 3x faster process completion
• Improved team satisfaction

The best part? Implementation took just 4 weeks with minimal disruption to their daily operations.

I believe {{company}} could see similar results. Would you be interested in a brief conversation to explore how this could apply to your specific situation?

Best regards,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-5",
    name: "Final Attempt",
    sequence: 5,
    delay: 21,
    subject: "One last attempt - {{company}}",
    template: `Hi {{firstName}},

This will be my last email, as I don't want to overwhelm your inbox.

I genuinely believe our solution could make a significant impact at {{company}}, but I understand timing isn't always right.

If you'd ever like to explore how we could help {{company}} achieve its goals more efficiently, I'm just an email away.

I wish you and {{company}} continued success.

Best regards,
{{senderName}}

P.S. If you'd prefer not to receive future emails from me, just reply with "remove" and I'll respect that request immediately.`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];