import React, { useState } from 'react';
import { TranslationSet } from '../data/translations';
import { CampaignResult } from '../types';
import { Sparkles, Send, MapPin, Smile, Users, RefreshCw, Lightbulb, Video, HelpCircle, CheckCircle2 } from 'lucide-react';

interface CampaignGeneratorProps {
  t: TranslationSet;
  isRtl: boolean;
}

export default function CampaignGenerator({ t, isRtl }: CampaignGeneratorProps) {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [targetLocation, setTargetLocation] = useState(isRtl ? 'دمشق وحلب' : 'Damascus & Aleppo');
  const [campaignTone, setCampaignTone] = useState(isRtl ? 'حماسي وإبداعي قريب من القلب' : 'Relatable, creative and energetic');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [activeTab, setActiveTab] = useState<'slogan' | 'concept' | 'storyboard' | 'billboard' | 'strategy'>('slogan');

  const tones = isRtl 
    ? ['حماسي وإبداعي قريب من القلب', 'فخم وأنيق يعكس العراقة', 'كوميدي ودرامي بالهوية السورية', 'عاطفي يلمس الوجدان', 'حديث وتكنولوجي سريع']
    : ['Relatable, creative & energetic', 'Premium, elegant & classic', 'Humorous & dramatic Syrian dialect', 'Emotional & heart-touching', 'Modern, sleek & futuristic'];

  const locations = isRtl 
    ? ['دمشق وباقي المحافظات السورية', 'حلب العريقة', 'الساحل السوري (اللاذقية وطرطوس)', 'الوطن العربي عامة', 'السوق السوري والعربي المشترك']
    : ['Damascus & Syrian cities', 'Aleppo historical hub', 'Syrian Coast (Lattakia & Tartous)', 'Arab World at large', 'Joint Syrian & Pan-Arab Market'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !businessType) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessType,
          targetAudience,
          targetLocation,
          campaignTone,
        }),
      });

      if (!response.ok) {
        throw new Error(isRtl ? 'حدث خطأ أثناء التواصل مع خادم التا الذكي.' : 'Failed to communicate with Alta smart server.');
      }

      const data = await response.json();
      setResult(data);
      // Automatically switch to slogan tab
      setActiveTab('slogan');
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isRtl ? 'عذراً، فشل توليد الحملة المبتكرة حالياً.' : 'Sorry, failed to generate campaign at this moment.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-generator-section" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
      {/* Background lights */}
      <div className="glow-spot-1 top-10 left-10"></div>
      <div className="glow-spot-2 bottom-10 right-10"></div>

      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glassmorphism-light text-brand-orange text-xs font-semibold tracking-wider uppercase mb-4 animate-pulse">
          <Sparkles size={14} />
          <span>ALTA AI LABS</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
          {t.genTitle}
        </h2>
        <p className="text-gray-400 text-base md:text-lg leading-relaxed">
          {t.genSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-brand-slate/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-brand-orange to-brand-gold"></div>
          
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <Lightbulb className="text-brand-orange" />
            <span>{isRtl ? 'معطيات الفكرة الملهمة' : 'Campaign Input Brief'}</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.genLabelName} <span className="text-brand-orange">*</span>
              </label>
              <input
                id="business-name"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t.genPlaceholderName}
                className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all duration-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.genLabelType} <span className="text-brand-orange">*</span>
              </label>
              <input
                id="business-type"
                type="text"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder={t.genPlaceholderType}
                className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all duration-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.genLabelAudience}
              </label>
              <input
                id="target-audience"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder={isRtl ? 'مثال: الشباب من 18-30 محبي القهوة والتجمع' : 'e.g. Young coffee lovers aged 18-30'}
                className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all duration-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <MapPin size={14} className="text-brand-gold" />
                  <span>{t.genLabelLocation}</span>
                </label>
                <select
                  id="target-location"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all duration-300 text-xs"
                >
                  {locations.map((loc, idx) => (
                    <option key={idx} value={loc} className="bg-brand-slate text-white text-xs">{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <Smile size={14} className="text-brand-gold" />
                  <span>{t.genLabelTone}</span>
                </label>
                <select
                  id="campaign-tone"
                  value={campaignTone}
                  onChange={(e) => setCampaignTone(e.target.value)}
                  className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all duration-300 text-xs"
                >
                  {tones.map((tone, idx) => (
                    <option key={idx} value={tone} className="bg-brand-slate text-white text-xs">{tone}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="submit-generate-btn"
              type="submit"
              disabled={loading || !businessName || !businessType}
              className={`w-full relative mt-4 overflow-hidden rounded-xl py-4 px-6 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                loading || !businessName || !businessType
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-orange to-brand-orange-light hover:shadow-lg hover:shadow-brand-orange/30 cursor-pointer transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin text-white" size={18} />
                  <span>{t.genBtnGenerating}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{t.genBtnSubmit}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed mt-2">
              {t.genDemoNotice}
            </p>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 bg-brand-slate/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 min-h-[480px] flex flex-col justify-between shadow-2xl relative">
          
          {/* Default/Waiting/Loading States */}
          {!loading && !result && !error && (
            <div className="my-auto text-center py-12 px-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-6 animate-bounce">
                <Sparkles size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">
                {isRtl ? 'انتظر وميض الإلهام' : 'Awaiting Creative Flash'}
              </h4>
              <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                {isRtl 
                  ? 'قم بتعبئة معطيات مشروعك على اليمين ثم اضغط على زر التوليد، لتقوم عقول التا برسم آفاق إبداعية تسويقية تذهل جمهورك المستهدف فوراً.'
                  : 'Fill out your business details on the left and click generate to let Alta AI weave stunning campaigns.'}
              </p>
              
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg text-xs text-gray-400">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                  <span className="font-bold text-brand-orange">Slogans</span>
                  <span>شعار رنان</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                  <span className="font-bold text-brand-gold">Video Ad</span>
                  <span>إعلان سينمائي</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-1 col-span-2 sm:col-span-1">
                  <span className="font-bold text-teal-400">Outdoor</span>
                  <span>لوحات طرقية</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="my-auto text-center py-16 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-brand-gold animate-pulse" size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white animate-pulse">
                {isRtl ? 'العقل الإبداعي لـ التا يعمل الآن...' : 'Alta Creative Mind is Conjuring...'}
              </h4>
              <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                {isRtl 
                  ? 'نقوم بتحليل السوق الجغرافي المستهدف وتوليد استراتيجية إبداعية، صياغة شعارات فريدة، وسيناريو تلفزيوني مميز يناسب تطلعاتكم.'
                  : 'We are mapping geographic parameters, scripting storyboards and outdoor concepts tailored for maximum conversion.'}
              </p>
            </div>
          )}

          {error && (
            <div className="my-auto text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={24} />
              </div>
              <h4 className="text-lg font-bold text-red-400 mb-2">{isRtl ? 'فشل التوليد الذكي' : 'Generation Failed'}</h4>
              <p className="text-gray-300 text-sm max-w-md mx-auto mb-6">{error}</p>
              <button 
                id="retry-generate-btn"
                onClick={handleGenerate}
                className="px-5 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white text-xs transition"
              >
                {isRtl ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}

          {/* Actual Results Render */}
          {result && !loading && (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-6 border-b border-white/10">
                  <div>
                    <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">
                      {isRtl ? 'حملة إعلانية مخصصة جاهزة' : 'AI Creative Concept Generated'}
                    </span>
                    <h4 className="text-2xl font-black text-white mt-1">
                      {result.slogan}
                    </h4>
                  </div>
                  {result.isFallback && (
                    <span className="bg-brand-orange/20 text-brand-orange text-[10px] px-2.5 py-1 rounded-full font-bold uppercase animate-pulse border border-brand-orange/30">
                      {isRtl ? 'وضع المعاينة' : 'Preview Demo Mode'}
                    </span>
                  )}
                </div>

                {/* Tabs Selector */}
                <div className="flex overflow-x-auto gap-2 py-4 my-2 border-b border-white/5 scrollbar-none">
                  {[
                    { id: 'slogan', label: isRtl ? 'الشعار' : 'Slogan', icon: Sparkles },
                    { id: 'concept', label: isRtl ? 'الرؤية المحورية' : 'Concept Core', icon: Lightbulb },
                    { id: 'storyboard', label: isRtl ? 'سيناريو الفيديو' : 'Video Script', icon: Video },
                    { id: 'billboard', label: isRtl ? 'بيلبورد طرقية' : 'Billboard', icon: MapPin },
                    { id: 'strategy', label: isRtl ? 'التكتيكات' : 'Tactics', icon: CheckCircle2 }
                  ].map((tab) => {
                    const IconComp = tab.icon;
                    return (
                      <button
                        id={`tab-btn-${tab.id}`}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <IconComp size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Output Area */}
                <div className="py-4 min-h-[220px] transition-all duration-500">
                  {activeTab === 'slogan' && (
                    <div className="space-y-4 animate-fade-in">
                      <h5 className="text-sm font-bold text-brand-orange uppercase tracking-wider">{t.genResultSlogan}</h5>
                      <div className="p-6 bg-brand-dark/60 rounded-xl border border-white/10 text-center relative overflow-hidden">
                        <span className="absolute -top-10 -right-10 text-9xl font-black text-white/5 select-none font-mono">“</span>
                        <p className="text-xl sm:text-2xl font-black text-brand-gold text-glow-gold relative z-10 leading-relaxed">
                          {result.slogan}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {isRtl 
                          ? 'هذا الشعار مصمم خصيصاً ليلائم اللهجة والثقافة المستهدفة ويتميز برنته القوية التي تعلق بذهن المستهلك لفترة طويلة.'
                          : 'This slogan is tailored to fit the localized language tone, and formulated for maximum psychological retention.'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'concept' && (
                    <div className="space-y-3 animate-fade-in">
                      <h5 className="text-sm font-bold text-brand-orange uppercase tracking-wider">{t.genResultConcept}</h5>
                      <p className="text-gray-200 text-sm leading-relaxed p-4 bg-brand-dark/40 rounded-xl border border-white/5">
                        {result.conceptCore}
                      </p>
                    </div>
                  )}

                  {activeTab === 'storyboard' && (
                    <div className="space-y-3 animate-fade-in">
                      <h5 className="text-sm font-bold text-brand-orange uppercase tracking-wider">{t.genResultVideo}</h5>
                      <p className="text-gray-200 text-sm leading-relaxed p-4 bg-brand-dark/40 rounded-xl border border-white/5 whitespace-pre-line">
                        {result.storyboard}
                      </p>
                    </div>
                  )}

                  {activeTab === 'billboard' && (
                    <div className="space-y-3 animate-fade-in">
                      <h5 className="text-sm font-bold text-brand-orange uppercase tracking-wider">{t.genResultBillboard}</h5>
                      <p className="text-gray-200 text-sm leading-relaxed p-4 bg-brand-dark/40 rounded-xl border border-white/5">
                        {result.billboardIdea}
                      </p>
                    </div>
                  )}

                  {activeTab === 'strategy' && (
                    <div className="space-y-3 animate-fade-in">
                      <h5 className="text-sm font-bold text-brand-orange uppercase tracking-wider">{t.genResultStrategy}</h5>
                      <ul className="space-y-3">
                        {result.strategy.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-gray-200 bg-brand-dark/40 p-3.5 rounded-xl border border-white/5">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons on results */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-teal-400" />
                  <span>{isRtl ? 'رؤية إبداعية حصرية من التا' : 'Exclusive creative vision by Alta'}</span>
                </span>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    id="copy-campaign-btn"
                    onClick={() => {
                      const textToCopy = `
Campaign: ${result.slogan}
Concept: ${result.conceptCore}
Storyboard: ${result.storyboard}
Billboard: ${result.billboardIdea}
                      `;
                      navigator.clipboard.writeText(textToCopy);
                      alert(isRtl ? 'تم نسخ تفاصيل الحملة الإعلانية إلى الحافظة!' : 'Campaign details copied to clipboard!');
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white transition-all duration-300"
                  >
                    {isRtl ? 'نسخ التفاصيل' : 'Copy Details'}
                  </button>
                  <a
                    id="book-consultation-btn"
                    href="#contact-section"
                    className="flex-1 sm:flex-initial px-4 py-2 bg-brand-orange hover:bg-brand-orange-light rounded-lg text-xs font-bold text-white transition-all duration-300 text-center"
                  >
                    {isRtl ? 'احجز استشارة لتنفيذها' : 'Execute Campaign Now'}
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
