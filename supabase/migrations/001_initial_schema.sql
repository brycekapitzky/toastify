-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type prospect_status as enum ('cold', 'contacted', 'replied', 'interested', 'qualified', 'handoff');
create type engagement_type as enum ('email_sent', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced', 'call_made', 'meeting_scheduled');

-- Create profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  email text unique not null,
  full_name text,
  avatar_url text,
  company_domain text,
  onboarding_completed boolean default false,
  onboarding_data jsonb default '{}'::jsonb,
  subscription_status text default 'free',
  subscription_plan text default 'starter'
);

-- Create prospects table
create table public.prospects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Basic info
  name text not null,
  email text not null,
  company text,
  title text,
  phone text,
  linkedin_url text,
  website text,
  
  -- Location
  city text,
  state text,
  country text,
  
  -- Engagement tracking
  status prospect_status default 'cold',
  engagement_group integer default 0 check (engagement_group >= 0 and engagement_group <= 6),
  opens integer default 0,
  clicks integer default 0,
  replies integer default 0,
  
  -- Email sequence tracking  
  current_stage integer default 0,
  last_contacted_at timestamptz,
  next_contact_at timestamptz,
  
  -- Additional data
  notes text,
  tags text[] default '{}',
  custom_data jsonb default '{}'::jsonb,
  
  -- Constraints
  unique(user_id, email)
);

-- Create engagement_events table
create table public.engagement_events (
  id uuid default uuid_generate_v4() primary key,
  prospect_id uuid references public.prospects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  
  type engagement_type not null,
  description text,
  metadata jsonb default '{}'::jsonb
);

-- Create email_stages table
create table public.email_stages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  name text not null,
  sequence integer not null,
  delay_days integer default 0,
  subject text not null,
  template text not null,
  is_active boolean default true,
  
  unique(user_id, sequence)
);

-- Create inboxes table
create table public.inboxes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  name text not null,
  email text not null,
  provider text default 'gmail',
  is_connected boolean default false,
  is_warming_up boolean default false,
  warm_up_daily_limit integer default 50,
  connection_data jsonb default '{}'::jsonb,
  
  unique(user_id, email)
);

-- Create sequences table
create table public.sequences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  name text not null,
  is_active boolean default false,
  daily_limit integer default 50,
  settings jsonb default '{}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.prospects enable row level security;
alter table public.engagement_events enable row level security;
alter table public.email_stages enable row level security;
alter table public.inboxes enable row level security;
alter table public.sequences enable row level security;

-- Create RLS policies
-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Prospects policies
create policy "Users can manage own prospects"
  on public.prospects for all
  using ( auth.uid() = user_id );

-- Engagement events policies  
create policy "Users can manage own engagement events"
  on public.engagement_events for all
  using ( auth.uid() = user_id );

-- Email stages policies
create policy "Users can manage own email stages"
  on public.email_stages for all
  using ( auth.uid() = user_id );

-- Inboxes policies
create policy "Users can manage own inboxes"
  on public.inboxes for all
  using ( auth.uid() = user_id );

-- Sequences policies
create policy "Users can manage own sequences"
  on public.sequences for all
  using ( auth.uid() = user_id );

-- Create functions and triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.prospects
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.email_stages
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.inboxes
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.sequences
  for each row execute procedure public.handle_updated_at();

-- Create function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for performance
create index prospects_user_id_idx on public.prospects(user_id);
create index prospects_status_idx on public.prospects(status);
create index prospects_engagement_group_idx on public.prospects(engagement_group);
create index prospects_email_idx on public.prospects(email);
create index engagement_events_prospect_id_idx on public.engagement_events(prospect_id);
create index engagement_events_type_idx on public.engagement_events(type);
create index email_stages_user_id_sequence_idx on public.email_stages(user_id, sequence);