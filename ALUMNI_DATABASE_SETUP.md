# KSO Alumni Database Setup Guide

## Overview
This guide will help you set up the KSO alumni database system with authentication, user profiles, and an alumni directory.

## Prerequisites
- A Supabase account and project
- Node.js and npm installed
- Basic knowledge of SQL

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note down your project URL and anon key

### 1.2 Set Up Environment Variables
Create a `.env.local` file in your project root with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 1.3 Create Database Schema
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script

## Step 2: Features Overview

### Authentication System
- **Sign Up**: Users can create accounts with email/password
- **Sign In**: Existing users can log in
- **Profile Management**: Users can edit their profiles
- **Session Management**: Automatic session handling

### User Types
- **Undergraduate Student**: Current undergrad students
- **Graduate Student**: Current grad students  
- **Alumni**: Graduated students
- **Board Member**: Current or past board members

### Profile Fields
- Full Name
- Email (from auth)
- Graduation Year
- Major
- User Type
- Board Position (if applicable)
- LinkedIn URL
- Bio
- Avatar (placeholder with initials)

### Alumni Directory
- **Browse**: View all alumni profiles
- **Search**: Search by name or major
- **Filter**: Filter by user type and graduation year
- **Responsive**: Works on mobile and desktop

## Step 3: Database Schema Details

### Tables
- **profiles**: Stores user profile information
- **auth.users**: Managed by Supabase Auth

### Row Level Security (RLS)
- Users can view all profiles
- Users can only edit their own profile
- Automatic profile creation on signup

### Indexes
- Optimized for common queries
- Fast search and filtering

## Step 4: Usage

### For Users
1. Visit `/auth` to sign up or sign in
2. Complete profile at `/profile`
3. Browse alumni at `/alumni`

### For Administrators
- All user data is stored in Supabase
- Can manage users through Supabase dashboard
- Can add admin features as needed

## Step 5: Customization

### Adding New Fields
1. Update the `Profile` interface in `src/lib/supabase.ts`
2. Add the field to the database schema
3. Update the profile form in `src/app/profile/page.tsx`

### Styling
- All components use Tailwind CSS
- Consistent with existing KSO website design
- Responsive design for all screen sizes

### Security
- Row Level Security enabled
- Email verification recommended
- Password requirements can be configured in Supabase

## Troubleshooting

### Common Issues
1. **Environment variables not loading**: Restart your development server
2. **Database connection errors**: Check your Supabase URL and key
3. **RLS errors**: Ensure policies are properly set up
4. **Type errors**: Check TypeScript interfaces match database schema

### Support
- Check Supabase documentation for detailed setup
- Review Next.js documentation for deployment
- Contact KSO technical team for assistance

## Next Steps
- Add email verification
- Implement admin panel
- Add profile photo upload
- Create alumni events system
- Add messaging between alumni 