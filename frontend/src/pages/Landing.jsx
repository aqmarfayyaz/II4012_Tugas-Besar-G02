import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">insights</span>
          <span className="font-bold text-xl tracking-tight text-primary">TalentPulse AI</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Platform</a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Solutions</a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Enterprise</a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-primary px-4 py-2 hover:bg-surface-container transition-colors rounded-lg">Sign In</button>
          <button onClick={() => navigate('/register')} className="text-sm bg-primary text-on-primary px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all">Request Demo</button>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant rounded-full mb-6">
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                  <span className="text-xs uppercase tracking-wider font-semibold">Next-Gen Recruitment</span>
                </div>
                <h1 className="text-5xl leading-tight text-primary mb-6 font-bold">
                  Hire the top 1% with <span className="text-primary-container">Autonomous Screening</span>
                </h1>
                <p className="text-base text-on-surface-variant mb-10 max-w-lg leading-relaxed">
                  TalentPulse AI orchestrates your entire enterprise recruitment workflow. From CV parsing to deep behavioral ranking, reduce time-to-hire by 80% without sacrificing quality.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => navigate('/register')} className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-3">
                    Get Started <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button className="border border-outline-variant text-primary px-8 py-4 rounded-xl font-bold text-base hover:bg-surface-container transition-all">
                    View Case Studies
                  </button>
                </div>
                <div className="mt-12 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-slate-400 to-slate-600"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-slate-300 to-slate-500"></div>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Trusted by <span className="font-bold text-primary">500+ Fortune companies</span>
                  </p>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="relative">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-container/30 blur-[100px] rounded-full"></div>
                <div className="glass-card p-4 rounded-2xl shadow-2xl relative overflow-hidden bg-slate-900">
                  <div className="w-full h-64 rounded-xl bg-gradient-to-br from-cyan-900/50 to-slate-900 flex items-center justify-center">
                    <span className="material-symbols-outlined text-cyan-400 text-6xl">analytics</span>
                  </div>
                </div>
                {/* KPI Badge */}
                <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-xl shadow-xl flex items-center gap-4 max-w-xs bg-white">
                  <div className="w-12 h-12 bg-on-secondary-container/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">trending_up</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-primary">94.2%</p>
                    <p className="text-xs text-on-surface-variant">Precision Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-surface-container-low border-y border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-wrap justify-between items-center opacity-40 grayscale gap-8">
              <span className="text-xl font-bold tracking-tighter">GLOBAL_TECH</span>
              <span className="text-xl font-bold tracking-tighter">ORBIT_SYSTEMS</span>
              <span className="text-xl font-bold tracking-tighter">FINANCE_FLOW</span>
              <span className="text-xl font-bold tracking-tighter">STRAT_CORP</span>
              <span className="text-xl font-bold tracking-tighter">VENTURE_AI</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-primary mb-4">Precision-Engineered Recruitment</h2>
              <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
                Powerful features designed to remove bias and accelerate your hiring pipeline with mathematical certainty.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-10 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div className="max-w-md">
                  <span className="material-symbols-outlined text-primary text-4xl mb-6 block group-hover:scale-110 transition-transform">cloud_upload</span>
                  <h3 className="text-2xl font-bold text-primary mb-4">Hyper-Scale CV Parsing</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                    Process thousands of resumes in seconds. Our proprietary NLP models extract skills, experience, and intent with 99.8% accuracy, mapping them directly to your internal job taxonomy.
                  </p>
                </div>
                <div className="mt-auto overflow-hidden rounded-xl border border-slate-100 h-48 bg-gradient-to-br from-slate-200 to-slate-300"></div>
              </div>

              {/* Feature 2 */}
              <div className="bg-primary text-on-primary rounded-2xl p-10 flex flex-col hover:shadow-xl transition-all">
                <span className="material-symbols-outlined text-secondary-fixed text-4xl mb-6 block">leaderboard</span>
                <h3 className="text-2xl font-bold text-white mb-4">Intelligent Ranking</h3>
                <p className="text-sm text-primary-fixed-dim leading-relaxed">
                  Stop manual sorting. Our AI ranks candidates based on technical fitness, cultural alignment markers, and career trajectory.
                </p>
                <div className="mt-12 space-y-4">
                  <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed" style={{width: '85%'}}></div>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed" style={{width: '60%'}}></div>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">insights</span>
                <h3 className="text-2xl font-bold text-primary mb-4">Deep Insights</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Visualize your pipeline health, diversity metrics, and sourcing effectiveness in real-time.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">hub</span>
                <h3 className="text-2xl font-bold text-primary mb-4">Enterprise Sync</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  One-click integration with Workday, SAP, and LinkedIn Recruiter. No heavy lifting required.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-surface-container-high rounded-2xl p-10 flex flex-col hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">shield_lock</span>
                <h3 className="text-2xl font-bold text-primary mb-4">Bank-Grade Security</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  SOC2 Type II compliant. Your talent data is encrypted and stays within your sovereign cloud instance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-8">
            <div className="bg-primary rounded-3xl p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-container rounded-full blur-[100px]"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your talent acquisition?</h2>
                <p className="text-base text-primary-fixed-dim mb-12 max-w-xl mx-auto">
                  Join the world's leading HR teams and experience the power of TalentPulse AI today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => navigate('/register')} className="bg-white text-primary px-10 py-5 rounded-xl font-bold text-base shadow-lg hover:bg-slate-50 transition-all">
                    Get Started Now
                  </button>
                  <button className="border border-white/20 text-white px-10 py-5 rounded-xl font-bold text-base hover:bg-white/5 transition-all">
                    Schedule a Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">insights</span>
                <span className="font-bold text-xl tracking-tight text-primary">TalentPulse</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Redefining the standard for enterprise-grade AI recruitment orchestration.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Screening AI</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-on-surface-variant">
            <p>© 2024 TalentPulse AI Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
