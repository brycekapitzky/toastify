import React, { useState } from 'react';
import { Mail, Users, TrendingUp, BarChart3, CheckCircle, Star, ArrowRight, Play, Zap, Target, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onTryDemo: () => void;
}

export function LandingPage({ onGetStarted, onSignIn, onTryDemo }: LandingPageProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const features = [
    {
      icon: Mail,
      title: 'Automated Email Sequences',
      description: 'Create personalized email campaigns that adapt based on prospect engagement and behavior.',
      benefit: 'Save 80% of manual outreach time'
    },
    {
      icon: Users,
      title: 'Smart Prospect Scoring',
      description: 'AI-powered engagement scoring moves prospects through stages automatically based on interactions.',
      benefit: 'Increase conversion rates by 3x'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track opens, clicks, replies, and conversion rates across all your campaigns with detailed insights.',
      benefit: 'Optimize performance with data'
    },
    {
      icon: Target,
      title: 'B2B Database Access',
      description: 'Search and filter over 2.5M prospects by company size, industry, job title, and technology stack.',
      benefit: 'Find your ideal customers fast'
    },
    {
      icon: Shield,
      title: 'Email Deliverability',
      description: 'Built-in warm-up system and reputation management to ensure your emails reach the inbox.',
      benefit: '98% inbox delivery rate'
    },
    {
      icon: Clock,
      title: 'Multi-Inbox Management',
      description: 'Manage multiple sending accounts with automatic rotation and daily limit controls.',
      benefit: 'Scale without limits'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'VP Sales, TechCorp',
      company: 'TechCorp Solutions',
      content: 'Our outreach efficiency increased by 300% within the first month. The automated scoring system helped us focus on the hottest leads and close more deals.',
      rating: 5,
      results: '+300% efficiency'
    },
    {
      name: 'Michael Chen',
      title: 'Founder',
      company: 'GrowthStart',
      content: 'Finally, a tool that actually understands how modern sales works. The engagement-based scoring is brilliant - we\'re closing deals faster than ever.',
      rating: 5,
      results: '2x faster closes'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Head of Sales',
      company: 'ScaleUp Inc',
      content: 'The B2B database integration is a game-changer. We went from manually researching prospects to having qualified leads in minutes.',
      rating: 5,
      results: '10x more leads'
    }
  ];

  const pricingFeatures = [
    'First 2,500 contacts FREE',
    'Unlimited email sequences',
    'Advanced analytics dashboard',
    'Multiple team inboxes',
    'B2B database access',
    'Email deliverability tools',
    'Priority support',
    'Custom integrations'
  ];

  const stats = [
    { value: '98%', label: 'Inbox Delivery Rate' },
    { value: '3x', label: 'Higher Response Rates' },
    { value: '80%', label: 'Time Saved vs Manual' },
    { value: '2.5M+', label: 'B2B Prospects' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Toastify</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onSignIn} className="hidden sm:inline-flex">
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Cold Email Outreach
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Turn Cold Prospects Into{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hot Leads
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Automate your entire outreach process with AI-powered prospect scoring, personalized email sequences, and advanced analytics. Get better results with less effort.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-lg px-8 py-4"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onTryDemo}
                className="text-lg px-8 py-4 border-2"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to scale outreach
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From prospect discovery to deal closure, our platform handles every step of your outreach workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {feature.benefit}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Import or Find Prospects</h3>
              <p className="text-gray-600">
                Upload your contact list or search our 2.5M+ B2B database to find your ideal prospects by industry, company size, and role.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Email Sequences</h3>
              <p className="text-gray-600">
                Set up personalized email sequences that automatically adapt based on prospect engagement and move them through your sales funnel.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Track & Convert</h3>
              <p className="text-gray-600">
                Monitor performance with detailed analytics and focus on hot leads that are ready to convert into customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by sales teams everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about their results
            </p>
          </div>

          <div className="relative">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                    <div className="text-gray-600">{testimonials[activeTestimonial].title}</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {testimonials[activeTestimonial].results}
                </Badge>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="text-center pb-8">
              <Badge className="mx-auto mb-4 bg-blue-100 text-blue-800 border-blue-200">
                Professional Plan
              </Badge>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-gray-900">$500</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mt-2">Perfect for growing businesses</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">First 2,500 contacts</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-green-700 font-medium">Additional contacts</span>
                  <span className="font-bold text-gray-900">$0.20 each</span>
                </div>
              </div>

              <div className="space-y-3">
                {pricingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={onTryDemo}
                  className="w-full"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Demo First
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your outreach?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of sales professionals who've increased their conversion rates with our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={onTryDemo}
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
            >
              <Play className="h-5 w-5 mr-2" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Toastify</span>
            </div>
            <div className="text-sm">
              © 2024 Toastify. Transform your sales outreach.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}