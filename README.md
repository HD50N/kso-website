# Korean Students Organization (KSO) Website

A modern, responsive website for the Korean Students Organization at the University of Chicago, built with Next.js and Tailwind CSS.

## 🎯 About KSO

The Korean Students Organization (KSO) is dedicated to fostering a vibrant community that celebrates Korean culture, promotes cultural understanding, and provides a supportive network for Korean and Korean-American students at the University of Chicago. Founded in 1976, KSO has been serving the UChicago community for over 48 years.

## ✨ Features

### 🏠 Homepage
- Hero section with mission statement
- Upcoming events showcase
- Quick statistics and achievements
- Social media integration
- Call-to-action sections

### 📖 About Us
- Organization history and timeline
- Mission and vision statements
- Core values
- Past accomplishments
- Community involvement opportunities

### 👥 Executive Board
- Board member profiles with roles and bios
- Leadership opportunities
- Contact information

### 🎭 Culture Show
- Interactive countdown timer
- Event details and RSVP form
- Past show highlights
- Volunteer opportunities
- Performance information



## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel-ready
- **Responsive**: Mobile-first design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kso-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── about/             # About Us page
│   ├── board/             # Executive Board page
│   ├── culture-show/      # Culture Show page

│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Navigation.tsx     # Navigation component
│   └── Footer.tsx         # Footer component
└── ...
```

## 🎨 Design Features

- **Modern Aesthetic**: Clean, minimalist design with vibrant red accent colors
- **Responsive Design**: Optimized for all device sizes
- **Accessibility**: WCAG compliant with proper semantic HTML
- **Performance**: Optimized images and code splitting
- **SEO**: Meta tags and structured data

## 📱 Pages Overview

### Homepage (`/`)
- Hero section with organization branding
- Mission statement
- Featured upcoming events
- Quick statistics
- Social media links

### About Us (`/about`)
- Organization history timeline
- Mission and vision
- Core values
- Past accomplishments
- Community involvement

### Executive Board (`/board`)
- Board member profiles
- Leadership opportunities
- Contact details

### Culture Show (`/culture-show`)
- Interactive countdown timer
- Event details
- RSVP form
- Past show highlights
- Volunteer signup



## 🔧 Customization

### Colors
The primary color scheme uses red tones. To customize:
- Primary: `red-600` (#DC2626)
- Secondary: `red-500` (#EF4444)
- Accent: `red-400` (#F87171)

### Content
- Update content in respective page files
- Replace placeholder images with actual photos
- Modify contact information and social media links

### Styling
- Tailwind CSS classes for styling
- Custom CSS in `globals.css` for specific needs
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`

## 📧 Contact Information

- **Email**: ksouchicago@gmail.com
- **Instagram**: @uchicagokso
- **Location**: University of Chicago, Chicago, IL 60637

## 🤝 Contributing for future Webmasters

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for the Korean Students Organization at the University of Chicago.

## 🙏 Acknowledgments

- University of Chicago community
- KSO members and alumni
- Next.js and Tailwind CSS communities

---

Built with ❤️ for the Korean Students Organization at the University of Chicago
