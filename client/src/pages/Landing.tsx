import { Link } from 'react-router-dom';
import { Shield, Lock, Clock, FileCheck, Smartphone, Target, HelpCircle, Mail, ChevronRight, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

function useIntersectionObserver() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function RevealOnScroll({ children, delay = 0, className = '' }: { children: ReactNode, delay?: number, className?: string }) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-1000 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false); // Close mobile menu if open
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { title: 'Real-time Attendance', description: 'Monitor guard attendance across multiple locations instantly.', icon: Clock },
    { title: 'Secure Firearm Tracking', description: 'Comprehensive logging for firearm issuance and returns.', icon: Lock },
    { title: 'Automated Reports', description: 'Generate end-of-day reports in seconds with a single click.', icon: FileCheck },
    { title: 'Mobile Responsive', description: 'Access the system reliably from any device, anywhere.', icon: Smartphone },
  ];

  const faqs = [
    { q: 'How secure is the platform?', a: 'We employ industry-leading encryption and strict access controls to ensure your data is always safe.' },
    { q: 'Can I manage multiple sites?', a: 'Yes, Secure Guard Pro supports unlimited sites and guard assignments perfectly.' },
    { q: 'Is there a mobile app?', a: 'Yes! We have a dedicated mobile app designed specifically for guards to easily time in and time out of their shifts.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
      {/* Navigation */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
              <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
              <span className="text-xl font-bold tracking-tight">SecureGuard</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex gap-8 items-center font-medium">
              <button onClick={() => scrollTo('home')} className="hover:text-blue-600 transition-colors cursor-pointer">Home</button>
              <button onClick={() => scrollTo('about')} className="hover:text-blue-600 transition-colors cursor-pointer">About</button>
              <button onClick={() => scrollTo('features')} className="hover:text-blue-600 transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollTo('faq')} className="hover:text-blue-600 transition-colors cursor-pointer">FAQ</button>
              <button onClick={() => scrollTo('contact')} className="hover:text-blue-600 transition-colors cursor-pointer">Contact</button>
            </div>
            
            <div className="hidden md:block">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:scale-105 hover:bg-blue-500 transition-all cursor-pointer"
              >
                Login
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-900 hover:text-blue-600 transition-colors cursor-pointer p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-slate-100 mt-4 flex flex-col gap-4 font-medium">
              <button onClick={() => scrollTo('home')} className="text-left py-2 hover:text-blue-600 transition-colors">Home</button>
              <button onClick={() => scrollTo('about')} className="text-left py-2 hover:text-blue-600 transition-colors">About</button>
              <button onClick={() => scrollTo('features')} className="text-left py-2 hover:text-blue-600 transition-colors">Features</button>
              <button onClick={() => scrollTo('faq')} className="text-left py-2 hover:text-blue-600 transition-colors">FAQ</button>
              <button onClick={() => scrollTo('contact')} className="text-left py-2 hover:text-blue-600 transition-colors">Contact</button>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all text-center cursor-pointer"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <RevealOnScroll className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight mb-8">
            Modernize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block hover:scale-105 transition-transform cursor-default">Security Operations</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
            Security Guard Attendance Monitoring and Worklfow Management System
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex flex-none items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:scale-105 hover:bg-slate-700 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Get Started <ChevronRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => scrollTo('features')}
              className="inline-flex flex-none items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 hover:scale-105 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </RevealOnScroll>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <RevealOnScroll delay={100} className="mb-10 lg:mb-0">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600 animate-bounce" />
                About SecureGuard Pro
              </h2>
              <p className="text-lg text-slate-600 mb-6 flex-wrap">
                Built specifically for modern security agencies, SecureGuard Pro eliminates the friction of paper logs and disconnected tools. Our unified platform empowers administrators and HR teams to maintain rigorous standards with zero overhead.
              </p>
              <p className="text-lg text-slate-600">
                With a focus on reliability and absolute data integrity, we help you keep your guards accountable and your assets completely secure.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={300} className="bg-slate-900 rounded-2xl p-8 shadow-inner aspect-video flex items-center justify-center hover:scale-[1.02] transition-transform duration-500">
               <Shield className="h-32 w-32 text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need</h2>
            <p className="mt-4 text-lg text-slate-600">Powerful features to run your operations flawlessly.</p>
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <RevealOnScroll key={i} delay={150} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-blue-600 hover:rotate-12 transition-transform" />
              Frequently Asked Questions
            </h2>
          </RevealOnScroll>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <RevealOnScroll key={i} delay={i * 100} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white overflow-hidden">
        <RevealOnScroll className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="h-12 w-12 mx-auto text-blue-500 mb-6 hover:-translate-y-2 transition-transform" />
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to upgrade your security?</h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Get in touch with our team today to learn how Secure Guard Pro can transform your operations.
          </p>
          <a
            href="mailto:contact@secureguard.com"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:scale-105 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all cursor-pointer"
          >
            Contact Sales
          </a>
        </RevealOnScroll>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4 hover:text-slate-400 transition-colors cursor-default">
            <Shield className="h-6 w-6 text-slate-700" />
            <span className="text-lg font-bold text-slate-400 tracking-tight">SecureGuard</span>
        </div>
        <p>&copy; {new Date().getFullYear()} SecureGuard Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
