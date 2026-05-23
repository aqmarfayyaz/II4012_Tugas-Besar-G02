import React from 'react';
import { useNavigate } from 'react-router-dom';
import officeBuilding from '../picture/photo-1486406146926-c627a92ad1ab.avif';
import officeFurniture from "../picture/Kit_Out_My_Office's_'HD_Colour'_(blue_photo_2)_office_furniture.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">insights</span>
          <span className="font-bold text-xl tracking-tight text-primary">TalentPulse AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm text-primary px-4 py-2 hover:bg-surface-container transition-colors rounded-lg">Sign In</button>
          <button onClick={() => navigate('/register')} className="text-sm bg-primary text-on-primary px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all">Get Started</button>
        </div>
      </header>

      <main className="pt-16">

        <section className="bg-white pt-20 pb-28">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant rounded-full mb-5">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="text-xs uppercase tracking-wider font-semibold">AI for Business</span>
                </div>
                <h1 className="text-5xl leading-tight text-primary mb-5 font-bold">
                  Hire the top 1% with{' '}
                  <span className="text-primary-container">Autonomous Screening</span>
                </h1>
                <p className="text-base text-on-surface-variant mb-8 max-w-lg leading-relaxed">
                  TalentPulse AI orchestrates your entire enterprise recruitment workflow. From CV parsing to deep behavioral ranking, reduce time-to-hire by 80% without sacrificing quality.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                >
                  Get Started <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>

              <div className="relative pb-8">
                <div className="absolute -top-16 -right-16 w-80 h-80 bg-secondary-container/30 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-slate-900 p-4">
                  <img
                    src={officeBuilding}
                    alt="Modern enterprise workspace"
                    loading="lazy"
                    className="w-full h-64 rounded-xl object-cover object-center"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs text-white font-semibold">Live Screening Active</span>
                  </div>
                </div>

                <div className="absolute -bottom-2 -left-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xl flex items-center gap-4">
                  <div className="w-11 h-11 bg-on-secondary-container/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container">trending_up</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-primary leading-none">94.2%</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Precision Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-primary mb-3">Precision-Engineered Recruitment</h2>
              <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
                Powerful features designed to remove bias and accelerate your hiring pipeline with mathematical certainty.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div className="max-w-md">
                  <span className="material-symbols-outlined text-primary text-4xl mb-4 block group-hover:scale-110 transition-transform">cloud_upload</span>
                  <h3 className="text-xl font-bold text-primary mb-3">Hyper-Scale CV Parsing</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Process thousands of resumes in seconds. Our NLP models extract skills, experience, and intent with 99.8% accuracy, mapping them directly to your internal job taxonomy.
                  </p>
                </div>
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-100 h-44">
                  <img
                    src={officeFurniture}
                    alt="Professional office workspace"
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>

              <div className="bg-primary text-on-primary rounded-2xl p-8 flex flex-col hover:shadow-xl transition-all">
                <span className="material-symbols-outlined text-secondary-fixed text-4xl mb-4 block">leaderboard</span>
                <h3 className="text-xl font-bold text-white mb-3">Intelligent Ranking</h3>
                <p className="text-sm text-primary-fixed-dim leading-relaxed">
                  Stop manual sorting. Our AI ranks candidates based on technical fitness, cultural alignment, and career trajectory.
                </p>
                <div className="mt-auto pt-8 space-y-3">
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">insights</span>
                <h3 className="text-xl font-bold text-primary mb-3">Deep Insights</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Visualize your pipeline health, diversity metrics, and sourcing effectiveness in real-time.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">hub</span>
                <h3 className="text-xl font-bold text-primary mb-3">Enterprise Sync</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  One-click integration with Workday, SAP, and LinkedIn Recruiter. No heavy lifting required.
                </p>
              </div>

              <div className="bg-surface-container-high rounded-2xl p-8 flex flex-col hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">shield_lock</span>
                <h3 className="text-xl font-bold text-primary mb-3">Bank-Grade Security</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  SOC2 Type II compliant. Your talent data is encrypted and stays within your sovereign cloud instance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-8">
            <div className="bg-primary rounded-3xl px-12 py-16 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 h-72 bg-primary-container rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your talent acquisition?</h2>
                <p className="text-base text-primary-fixed-dim mb-10 max-w-lg mx-auto">
                  Join the world's leading HR teams and experience the power of TalentPulse AI today.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-base shadow-lg hover:bg-slate-50 transition-all"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">

            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">insights</span>
                <span className="font-bold text-xl tracking-tight text-primary">TalentPulse</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Redefining the standard for enterprise-grade AI recruitment orchestration.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Screening AI</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-on-surface-variant">
            <div className="flex gap-5">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
