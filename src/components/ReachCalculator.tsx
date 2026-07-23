import React, { useState, useEffect } from 'react';
import { TranslationSet } from '../data/translations';
import { HelpCircle, BarChart3, Users, Eye, Target, MapPin } from 'lucide-react';

interface ReachCalculatorProps {
  t: TranslationSet;
  isRtl: boolean;
}

export default function ReachCalculator({ t, isRtl }: ReachCalculatorProps) {
  const [budget, setBudget] = useState(5000000); // 5 Million SYP as default
  const [currency, setCurrency] = useState<'SYP' | 'USD'>('SYP');
  const channel = 'digital';
  const [targetCity, setTargetCity] = useState<string>('all');
  
  // New social media sponsored settings
  const [isSponsoredAd, setIsSponsoredAd] = useState<boolean>(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram', 'tiktok']);
  const [adObjective, setAdObjective] = useState<'awareness' | 'traffic' | 'engagement' | 'leads'>('awareness');

  const [metrics, setMetrics] = useState({
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversion: 0
  });

  const cities = isRtl 
    ? [
        { id: 'all', name: 'كل المحافظات والأسواق', multiplier: 1.0 },
        { id: 'damascus', name: 'دمشق وريفها (الكثافة الأعلى)', multiplier: 1.2 },
        { id: 'aleppo', name: 'حلب (العاصمة الاقتصادية)', multiplier: 1.1 },
        { id: 'coast', name: 'الساحل السوري (اللاذقية وطرطوس)', multiplier: 0.95 },
        { id: 'homs', name: 'حمص وحماة', multiplier: 0.85 },
        { id: 'arab', name: 'دول الخليج والشرق الأوسط عامة', multiplier: 0.6 } // USD scale primarily
      ]
    : [
        { id: 'all', name: 'All Syrian & Arab Markets', multiplier: 1.0 },
        { id: 'damascus', name: 'Damascus Hub (Highest Density)', multiplier: 1.2 },
        { id: 'aleppo', name: 'Aleppo (Economic Capital)', multiplier: 1.1 },
        { id: 'coast', name: 'Syrian Coast (Lattakia & Tartous)', multiplier: 0.95 },
        { id: 'homs', name: 'Homs & Hama', multiplier: 0.85 },
        { id: 'arab', name: 'GCC & Pan-Arab Region', multiplier: 0.6 }
      ];

  // Recalculate metrics on inputs modification
  useEffect(() => {
    // Basic values based on USD normalization
    const normalizedBudgetUsd = currency === 'USD' ? budget : budget / 15000; // Normalizing rate
    const selectedCity = cities.find(c => c.id === targetCity) || cities[0];
    const mult = selectedCity.multiplier;

    let impressions = 0;
    let reach = 0;
    let clicks = 0;
    let conversion = 0;

    if (isSponsoredAd) {
      // Detailed sponsored ad calculation
      // Calculate blended CPM and CTR
      let totalCpm = 0;
      let totalCtr = 0;
      let totalConv = 0;
      
      const activePlatforms = selectedPlatforms.length > 0 ? selectedPlatforms : ['facebook'];

      activePlatforms.forEach(p => {
        let baseSyriaCpm = 0.2;
        let baseGccCpm = 3.0;
        let baseCtr = 0.015;
        let baseConv = 0.02;

        switch (p) {
          case 'facebook':
            baseSyriaCpm = 0.18;
            baseGccCpm = 2.5;
            baseCtr = 0.016;
            baseConv = 0.02;
            break;
          case 'instagram':
            baseSyriaCpm = 0.28;
            baseGccCpm = 4.0;
            baseCtr = 0.012;
            baseConv = 0.022;
            break;
          case 'tiktok':
            baseSyriaCpm = 0.22;
            baseGccCpm = 3.0;
            baseCtr = 0.018;
            baseConv = 0.018;
            break;
          case 'youtube':
            baseSyriaCpm = 0.50;
            baseGccCpm = 4.5;
            baseCtr = 0.009;
            baseConv = 0.025;
            break;
          case 'linkedin':
            baseSyriaCpm = 1.50;
            baseGccCpm = 12.0;
            baseCtr = 0.007;
            baseConv = 0.035;
            break;
        }

        let platformCpm = 0.2;
        if (targetCity === 'arab') {
          platformCpm = baseGccCpm;
        } else if (targetCity === 'all') {
          platformCpm = (baseSyriaCpm * 0.7) + (baseGccCpm * 0.3);
        } else {
          // Syrian city. We apply the city multiplier inversely to make CPM lower in higher density
          platformCpm = baseSyriaCpm / mult;
        }

        totalCpm += platformCpm;
        totalCtr += baseCtr;
        totalConv += baseConv;
      });

      // Blended stats
      const avgCpm = totalCpm / activePlatforms.length;
      const avgCtr = totalCtr / activePlatforms.length;
      const avgConv = totalConv / activePlatforms.length;

      // Apply objective multipliers
      let objCpmMult = 1.0;
      let objCtrMult = 1.0;
      let objConvMult = 1.0;

      switch (adObjective) {
        case 'awareness':
          objCpmMult = 0.7; // Cheaper views
          objCtrMult = 0.8;
          objConvMult = 0.6;
          break;
        case 'traffic':
          objCpmMult = 1.2;
          objCtrMult = 2.2; // High CTR
          objConvMult = 1.2;
          break;
        case 'engagement':
          objCpmMult = 1.0;
          objCtrMult = 1.3;
          objConvMult = 1.0;
          break;
        case 'leads':
          objCpmMult = 1.8; // Expensive CPM
          objCtrMult = 1.6;
          objConvMult = 2.8; // High conversions
          break;
      }

      // Calculations
      const blendedCpm = avgCpm * objCpmMult;
      const blendedCtr = avgCtr * objCtrMult;
      const blendedConv = avgConv * objConvMult;

      // Total impressions = (Budget / CPM) * 1000
      impressions = (normalizedBudgetUsd / blendedCpm) * 1000;
      // Reach is 70% of impressions (unique viewers)
      reach = impressions * 0.70;
      // Clicks / Engagements
      clicks = impressions * blendedCtr;
      // Conversions
      conversion = clicks * blendedConv;

    } else {
      // Digital, but organic / influencer based
      const baseImpressions = normalizedBudgetUsd * 80 * mult;
      impressions = baseImpressions;
      reach = baseImpressions * 0.65;
      clicks = reach * 0.06;
      conversion = clicks * 0.022;
    }

    setMetrics({
      impressions: Math.round(impressions),
      reach: Math.round(reach),
      clicks: Math.round(clicks),
      conversion: Math.round(conversion)
    });
  }, [budget, currency, targetCity, isSponsoredAd, selectedPlatforms, adObjective]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + (isRtl ? ' مليون' : 'M');
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + (isRtl ? ' ألف' : 'K');
    }
    return num.toString();
  };

  return (
    <div id="calculator-section" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glassmorphism-light text-brand-gold text-xs font-semibold tracking-wider uppercase mb-4 animate-pulse">
          <BarChart3 size={14} />
          <span>REACH ESTIMATOR</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-6 text-white leading-tight">
          {t.calcTitle}
        </h2>
        <p className="text-gray-400 text-base md:text-lg">
          {t.calcSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Sliders and Configurations */}
        <div className="lg:col-span-6 bg-brand-slate/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Currency toggle */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-brand-orange" />
                <span>{isRtl ? 'إعدادات ميزانية الحملة' : 'Campaign Budget Settings'}</span>
              </h3>
              <div className="bg-brand-dark/80 p-0.5 rounded-lg border border-white/10 flex">
                <button
                  id="currency-syp-btn"
                  onClick={() => {
                    setCurrency('SYP');
                    setBudget(5000000);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    currency === 'SYP' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SYP
                </button>
                <button
                  id="currency-usd-btn"
                  onClick={() => {
                    setCurrency('USD');
                    setBudget(5000);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    currency === 'USD' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            {/* Slider container */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{t.calcLabelBudget}</span>
                <span className="font-mono text-brand-gold font-bold text-lg">
                  {budget.toLocaleString()} {currency === 'SYP' ? (isRtl ? 'ل.س' : 'SYP') : '$'}
                </span>
              </div>
              <input
                id="budget-slider"
                type="range"
                min={currency === 'SYP' ? 1000000 : 500}
                max={currency === 'SYP' ? 100000000 : 50000}
                step={currency === 'SYP' ? 500000 : 250}
                value={budget}
                onChange={handleBudgetChange}
                className="w-full accent-brand-orange bg-brand-dark/80 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                <span>{currency === 'SYP' ? '1M' : '$500'}</span>
                <span>{currency === 'SYP' ? '50M' : '$25K'}</span>
                <span>{currency === 'SYP' ? '100M' : '$50K'}</span>
              </div>
            </div>

            {/* Area/Region dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <MapPin size={15} className="text-brand-orange" />
                <span>{isRtl ? 'منطقة التركيز الجغرافي' : 'Focus Geographic Region'}</span>
              </label>
              <select
                id="calc-target-city"
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-sm"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id} className="bg-brand-slate text-white">{city.name}</option>
                ))}
              </select>
            </div>

            {/* DIGITAL OPTIONS FOR SPONSORED ADS */}
            <div className="p-4 rounded-xl bg-brand-dark/60 border border-white/10 space-y-4 animate-fade-in">
              
              {/* 1. Toggle between Sponsored Ad & Organic/Influencer */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-gray-300">
                  {isRtl ? 'نوع الترويج الرقمي:' : 'Digital Promotion Type:'}
                </span>
                <div className="flex bg-brand-slate/60 p-0.5 rounded-lg border border-white/5">
                  <button
                    id="campaign-sponsored-btn"
                    type="button"
                    onClick={() => setIsSponsoredAd(true)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                      isSponsoredAd ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'إعلان ممول' : 'Sponsored Ad'}
                  </button>
                  <button
                    id="campaign-organic-btn"
                    type="button"
                    onClick={() => setIsSponsoredAd(false)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                      !isSponsoredAd ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'عضوي ومؤثرين' : 'Organic/Influencers'}
                  </button>
                </div>
              </div>

              {isSponsoredAd ? (
                <>
                  {/* 2. Platform Multi-Select */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-400">
                      {isRtl ? 'المنصات الممولة المستهدفة:' : 'Targeted Sponsored Platforms:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'facebook', name: 'Facebook', labelAr: 'فيسبوك' },
                        { id: 'instagram', name: 'Instagram', labelAr: 'إنستغرام' },
                        { id: 'tiktok', name: 'TikTok', labelAr: 'تيك توك' },
                        { id: 'youtube', name: 'YouTube', labelAr: 'يوتيوب' },
                        { id: 'linkedin', name: 'LinkedIn', labelAr: 'لينكد إن' }
                      ].map(plat => {
                        const active = selectedPlatforms.includes(plat.id);
                        return (
                          <button
                            id={`platform-select-btn-${plat.id}`}
                            key={plat.id}
                            type="button"
                            onClick={() => {
                              if (active) {
                                // Keep at least one platform selected
                                if (selectedPlatforms.length > 1) {
                                  setSelectedPlatforms(selectedPlatforms.filter(p => p !== plat.id));
                                }
                              } else {
                                setSelectedPlatforms([...selectedPlatforms, plat.id]);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                              active
                                ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/10'
                                : 'bg-brand-dark/40 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            <span>{isRtl ? plat.labelAr : plat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Campaign Objective Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-400">
                      {isRtl ? 'الهدف الإعلاني الممول:' : 'Sponsored Campaign Goal:'}
                    </label>
                    <select
                      id="ad-objective-select"
                      value={adObjective}
                      onChange={(e) => setAdObjective(e.target.value as any)}
                      className="w-full bg-brand-dark/40 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-orange text-xs"
                    >
                      <option value="awareness" className="bg-brand-slate text-white">
                        {isRtl ? 'زيادة الوعي والانتشار (أقصى مشاهدات)' : 'Brand Awareness (Max Impressions)'}
                      </option>
                      <option value="traffic" className="bg-brand-slate text-white">
                        {isRtl ? 'جلب الزيارات ونقرات الروابط (توجيه لموقعك)' : 'Website Traffic (Max Link Clicks)'}
                      </option>
                      <option value="engagement" className="bg-brand-slate text-white">
                        {isRtl ? 'التفاعل والمشاركات (زيادة المتابعين)' : 'Active Engagement (Max Likes/Shares)'}
                      </option>
                      <option value="leads" className="bg-brand-slate text-white">
                        {isRtl ? 'العملاء والمبيعات (الحصول على مشترين)' : 'Leads & Sales (Max Conversions)'}
                      </option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-gray-400 bg-brand-dark/20 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                  {isRtl 
                    ? 'الحملات غير الممولة تعتمد على صناعة المحتوى السوري الفكاهي، والتعاون مع المؤثرين لزيادة الوصول الطبيعي دون كلف دفع مباشرة للمنصات.' 
                    : 'Organic campaigns rely on creating viral localized content, and partnering with top regional influencers to boost natural reach without pay-to-play platform costs.'}
                </div>
              )}
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-xs text-gray-500">
            {t.calcFormSponsor}
          </div>
        </div>

        {/* Dynamic Interactive Metrics & Graph */}
        <div className="lg:col-span-6 bg-brand-slate/30 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Users size={20} className="text-brand-gold" />
              <span>{t.calcEstReach}</span>
            </h3>

            {/* Reach Dashboard Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-brand-orange"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <Eye size={13} className="text-brand-orange" />
                  <span>{isRtl ? 'المشاهدات التقديرية' : 'Estimated Impressions'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 text-glow-orange">
                  {formatNumber(metrics.impressions)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'مرات ظهور مكررة للعلامة' : 'Ad placements exposure count'}</div>
              </div>

              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-brand-gold"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <Users size={13} className="text-brand-gold" />
                  <span>{isRtl ? 'الجمهور الفريد المستهدف' : 'Unique Target Audience'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-brand-gold font-mono mt-1 text-glow-gold">
                  {formatNumber(metrics.reach)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'أشخاص حقيقيون يلمسون الرسالة' : 'Individual people engaged'}</div>
              </div>

              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-teal-500"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span>{isRtl ? 'التفاعلات والاهتمام النشط' : 'Active Engagement / Clicks'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                  {formatNumber(metrics.clicks)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'استفسارات ومشاركات مباشرة' : 'Direct actions & queries'}</div>
              </div>

              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>{isRtl ? 'مبيعات / عملاء محتملين' : 'Estimated Conversions'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-1">
                  {formatNumber(metrics.conversion)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'عمليات شراء أو تعاقد فعلي' : 'Completed client acquisitions'}</div>
              </div>
            </div>

            {/* Custom SVG Reach over 7-Day Chart for stunning visual finish */}
            <div className="bg-brand-dark/40 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">{isRtl ? 'ارتفاع مؤشر الانتشار اليومي للحملة' : 'Daily Reach Growth Index'}</span>
                <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded font-mono">7 Days</span>
              </div>
              <div className="h-28 flex items-end justify-between gap-1.5 pt-4 px-2 relative">
                {/* SVG background line */}
                <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" preserveAspectRatio="none">
                  <path
                    d={`M 10 90 Q 60 ${90 - (metrics.reach % 30)} 120 ${80 - (metrics.reach % 45)} T 240 ${60 - (metrics.reach % 35)} T 360 ${40 - (metrics.reach % 40)} T 480 ${25 - (metrics.reach % 20)}`}
                    fill="none"
                    stroke="rgba(255, 92, 53, 0.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 10 90 Q 60 ${90 - (metrics.reach % 30)} 120 ${80 - (metrics.reach % 45)} T 240 ${60 - (metrics.reach % 35)} T 360 ${40 - (metrics.reach % 40)} T 480 ${25 - (metrics.reach % 20)} L 480 100 L 10 100 Z`}
                    fill="url(#chart-grad)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff5c35" />
                      <stop offset="100%" stopColor="#ff5c35" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Simulated vertical growth indicators */}
                {[...Array(7)].map((_, idx) => {
                  const factor = [0.15, 0.28, 0.45, 0.62, 0.78, 0.9, 1.0][idx];
                  const height = factor * 80;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10">
                      <div className="w-full bg-gradient-to-t from-brand-orange/20 to-brand-orange/80 rounded-t" style={{ height: `${height}px` }}></div>
                      <span className="text-[9px] text-gray-500 font-mono mt-1">D{idx+1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform-specific breakdown when Sponsored is active */}
            {isSponsoredAd && (
              <div className="mt-6 bg-brand-dark/40 p-5 rounded-xl border border-white/5 space-y-3.5 animate-fade-in">
                <span className="text-xs font-bold text-gray-300 block">
                  {isRtl ? 'توزيع الميزانية والانتشار التقريبي لكل منصة ممولة:' : 'Approximate Budget Distribution & Reach per Platform:'}
                </span>
                
                <div className="space-y-3.5">
                  {[
                    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', textAr: 'فيسبوك' },
                    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600', textAr: 'إنستغرام' },
                    { id: 'tiktok', name: 'TikTok', color: 'bg-black border border-white/20', textAr: 'تيك توك' },
                    { id: 'youtube', name: 'YouTube', color: 'bg-red-600', textAr: 'يوتيوب' },
                    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-800', textAr: 'لينكد إن' }
                  ]
                  .filter(p => selectedPlatforms.includes(p.id))
                  .map(p => {
                    const share = 1 / Math.max(selectedPlatforms.length, 1);
                    const platImpressions = metrics.impressions * share;
                    const platReach = metrics.reach * share;
                    const percent = Math.round(share * 100);
                    
                    return (
                      <div key={p.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${p.color}`}></span>
                            <span>{isRtl ? p.textAr : p.name}</span>
                            <span className="text-[10px] text-gray-500 font-normal font-mono">({percent}%)</span>
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            {isRtl ? 'الوصول: ' : 'Reach: '}
                            <span className="text-brand-gold font-bold">{formatNumber(platReach)}</span>
                            <span className="mx-2 text-gray-600">|</span>
                            {isRtl ? 'الظهور: ' : 'Imps: '}
                            <span className="text-white font-medium">{formatNumber(platImpressions)}</span>
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-brand-dark/80 h-2 rounded-full overflow-hidden p-[1px] border border-white/5">
                          <div 
                            className={`h-full ${p.color} rounded-full transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 leading-relaxed text-center sm:text-right">
              {isRtl 
                ? 'هل تريد حجز خطتك للحصول على لوحات طرقية حصرية في أرقى شوارع دمشق وحلب؟' 
                : 'Ready to secure high-visibility billboards in Damascus and Aleppo hubs?'}
            </p>
            <a
              id="calc-book-consult-btn"
              href="#contact-section"
              className="px-5 py-2 bg-brand-gold hover:bg-yellow-600 text-brand-dark font-black text-xs rounded-lg transition duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {isRtl ? 'احجز استشارة مجانية' : 'Book Free Strategy'}
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
