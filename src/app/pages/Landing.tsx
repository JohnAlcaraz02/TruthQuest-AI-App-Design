import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Brain,
  Search,
  Eye,
  BookOpen,
  Shield,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Search,
      title: "Content Analyzer",
      description: "Analyze articles, social media posts, and websites for credibility and bias.",
    },
    {
      icon: Eye,
      title: "Deepfake Detector",
      description: "Detect manipulated images, videos, and audio using advanced AI technology.",
    },
    {
      icon: BookOpen,
      title: "Learning Hub",
      description: "Interactive lessons and quizzes to develop critical thinking skills.",
    },
    {
      icon: Shield,
      title: "Source Verification",
      description: "Check the reliability and reputation of news sources and publishers.",
    },
    {
      icon: Award,
      title: "Gamified Learning",
      description: "Earn XP, badges, and climb leaderboards while building media literacy.",
    },
    {
      icon: Users,
      title: "Teacher Dashboard",
      description: "Track student progress and assign media literacy challenges.",
    },
  ];

  const stats = [
    { value: "500K+", label: "Active Users" },
    { value: "2M+", label: "Content Analyzed" },
    { value: "95%", label: "Accuracy Rate" },
    { value: "150+", label: "Schools" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "High School Student",
      content: "TruthQuest AI helped me become more critical of what I see online. I now verify sources before sharing!",
      avatar: "SC",
    },
    {
      name: "Mr. Johnson",
      role: "Media Studies Teacher",
      content: "An invaluable tool for teaching media literacy. My students are more engaged than ever.",
      avatar: "MJ",
    },
    {
      name: "Alex Rodriguez",
      role: "College Student",
      content: "The deepfake detector is amazing! It's helped me identify misinformation multiple times.",
      avatar: "AR",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">TruthQuest AI</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/learning"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Learning Hub
              </Link>
              <Link
                to="/mobile"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Mobile App
              </Link>
              <Link
                to="/teacher"
                className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
              >
                Teacher Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Media Literacy</span>
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                Navigate Information with{" "}
                <span className="text-primary">Confidence</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                AI-powered media literacy for the next generation. Learn to identify misinformation,
                detect bias, and become a critical digital citizen.
              </p>
              <p className="text-lg font-medium text-foreground mb-8 italic">
                "Think Before You Share."
              </p>
              <div className="flex gap-4">
                <Link
                  to="/analyze"
                  className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Analyze Content
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/learning"
                  className="px-8 py-4 bg-card border-2 border-border text-foreground rounded-xl font-medium hover:border-primary transition-all"
                >
                  Start Learning
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-success/10 to-secondary/10 rounded-xl p-4 border border-success/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">Credibility Score</span>
                      <span className="text-2xl font-bold text-success">85/100</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Source Reliability</span>
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Low Bias Detected</span>
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-24 bg-muted rounded-lg" />
                    <div className="flex-1 h-24 bg-muted rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features for Media Literacy
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to navigate the digital information landscape
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Start your media literacy journey in three simple steps
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Analyze Content",
                description: "Paste a URL, article text, or upload media for instant AI-powered analysis.",
              },
              {
                step: "02",
                title: "Learn & Understand",
                description: "Get detailed insights on credibility, bias, and manipulation techniques.",
              },
              {
                step: "03",
                title: "Build Skills",
                description: "Complete lessons and challenges to become a media-literate citizen.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted by Students & Educators
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Become Media Literate?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of students and educators building critical thinking skills
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white text-primary rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Get Started Free
              </Link>
              <Link
                to="/teacher"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                For Educators
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-foreground">TruthQuest AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering the next generation with media literacy skills.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/analyze" className="text-sm text-muted-foreground hover:text-primary">
                    Content Analyzer
                  </Link>
                </li>
                <li>
                  <Link to="/deepfake" className="text-sm text-muted-foreground hover:text-primary">
                    Deepfake Detector
                  </Link>
                </li>
                <li>
                  <Link to="/learning" className="text-sm text-muted-foreground hover:text-primary">
                    Learning Hub
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 TruthQuest AI. All rights reserved. Think Before You Share.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
