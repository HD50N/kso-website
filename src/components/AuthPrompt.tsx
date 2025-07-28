import Link from 'next/link';
import Navigation from './Navigation';
import Footer from './Footer';

interface AuthPromptProps {
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export default function AuthPrompt({ title, description, features, ctaText, ctaHref }: AuthPromptProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-black mb-2">Features</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
          <Link 
            href={ctaHref}
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {ctaText}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
} 