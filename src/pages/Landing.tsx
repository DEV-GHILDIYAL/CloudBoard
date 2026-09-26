import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Layout, Layers, ShieldCheck, Share2, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            CloudBoard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-slate-400 hover:text-white font-medium transition-colors text-sm px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-6 py-20 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-semibold mb-6 animate-pulse">
          <Activity className="w-3.5 h-3.5" />
          <span>Interactive SVG Engine — No Installation Required</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Design Cloud Architectures
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            with Ultimate Simplicity
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          CloudBoard is an open, intuitive, browser-based diagramming canvas for sketching AWS resources, DevOps connections, and shapes. Auto-saves to the cloud.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-20 w-full max-w-md">
          <Link
            to="/signup"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Start Designing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-250 font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Try Sandbox
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Card 1 */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl text-left transition-all hover:translate-y-[-4px]">
            <div className="bg-indigo-950 border border-indigo-900 text-indigo-400 p-3 rounded-xl w-fit mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Infinite SVG Canvas</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pan and zoom smoothly across an infinite dot-grid board. Drag, drop, scale, and snap items with pixel precision.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl text-left transition-all hover:translate-y-[-4px]">
            <div className="bg-purple-950 border border-purple-900 text-purple-400 p-3 rounded-xl w-fit mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Connections</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create clean curved connection lines between AWS resources with a single click. Connections scale and reroute as you drag.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl text-left transition-all hover:translate-y-[-4px]">
            <div className="bg-fuchsia-950 border border-fuchsia-900 text-fuchsia-400 p-3 rounded-xl w-fit mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Export & Share</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Download your diagrams as clean, high-resolution vector SVGs with automatically calculated dimensions and zero watermark.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secured by Supabase and local sandboxing</span>
          </div>
          <span>&copy; {new Date().getFullYear()} CloudBoard. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
