import React, { useState, useEffect } from "react";
import { 
  Palette, 
  FileText, 
  Layout, 
  Briefcase, 
  Lock, 
  Save, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  AlertCircle,
  X,
  Globe,
  Settings,
  Sparkles,
  RefreshCw,
  Image
} from "lucide-react";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: any;
  onConfigUpdated: (newConfig: any) => void;
  isRtl: boolean;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  currentConfig,
  onConfigUpdated,
  isRtl
}: AdminDashboardProps) {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs: 'branding' | 'texts' | 'services' | 'portfolio' | 'security'
  const [activeTab, setActiveTab] = useState<"branding" | "texts" | "services" | "portfolio" | "security">("branding");

  // Editable configurations states
  const [theme, setTheme] = useState({
    primaryColor: "#ff5c35",
    secondaryColor: "#e2b053",
    logoLetter: "A",
    logoNameAr: "التا للإعلان",
    logoNameEn: "ALTA ADVERTISING"
  });

  const [translationsAr, setTranslationsAr] = useState<any>({});
  const [translationsEn, setTranslationsEn] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  // Editing forms state
  const [textLangToEdit, setTextLangToEdit] = useState<"ar" | "en">("ar");

  // Service modal / inline form state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    titleAr: "",
    titleEn: "",
    descAr: "",
    descEn: "",
    subtitleAr: "",
    subtitleEn: "",
    icon: "Sparkles"
  });

  // Portfolio modal / inline form state
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    titleAr: "",
    titleEn: "",
    descAr: "",
    descEn: "",
    category: "outdoor",
    tagAr: "لوحات طرقية",
    tagEn: "Outdoor Billboard",
    image: "",
    statAr: "",
    statEn: "",
    clientAr: "",
    clientEn: "",
    year: "2026",
    detailsAr: "",
    detailsEn: ""
  });

  // Security password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  // Global action notifications
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Initialize config state when opened or currentConfig changes
  useEffect(() => {
    if (currentConfig) {
      if (currentConfig.theme) setTheme({ ...currentConfig.theme });
      if (currentConfig.translations) {
        setTranslationsAr({ ...currentConfig.translations.ar });
        setTranslationsEn({ ...currentConfig.translations.en });
      }
      if (currentConfig.services) setServices([...currentConfig.services]);
      if (currentConfig.portfolioItems) setPortfolioItems([...currentConfig.portfolioItems]);
    }
  }, [currentConfig]);

  // Try to load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("alta_admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  if (!isOpen) return null;

  // Handle Admin Login API Call
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      setToken(data.token);
      localStorage.setItem("alta_admin_token", data.token);
      setIsLoggedIn(true);
      // Reset credentials
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setLoginError(err.message || "اسم المستخدم أو كلمة المرور خاطئة!");
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout admin
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("alta_admin_token");
    setIsLoggedIn(false);
    setActionSuccess("");
  };

  // Change Admin Password API Call
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError("");
    setSecuritySuccess("");

    if (newPassword !== confirmNewPassword) {
      setSecurityError(isRtl ? "كلمتا المرور الجديدتان غير متطابقتين!" : "New passwords do not match!");
      return;
    }

    setSecurityLoading(true);

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل تغيير كلمة المرور");
      }

      setSecuritySuccess(isRtl ? "تم تغيير كلمة المرور بنجاح!" : "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setSecurityError(err.message || "حدث خطأ أثناء تغيير كلمة المرور!");
    } finally {
      setSecurityLoading(false);
    }
  };

  // Push updated configuration to the backend server
  const handleSaveAllConfig = async () => {
    setSaveLoading(true);
    setActionError("");
    setActionSuccess("");

    const updatedConfig = {
      theme,
      translations: {
        ar: translationsAr,
        en: translationsEn
      },
      services,
      portfolioItems
    };

    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedConfig)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل حفظ البيانات");
      }

      setActionSuccess(isRtl ? "تم حفظ جميع التعديلات بنجاح وتعميمها على الموقع!" : "Changes saved and deployed successfully!");
      onConfigUpdated(updatedConfig);
      
      // Auto-clear success message after 4s
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setActionError(err.message || "حدث خطأ غير متوقع أثناء الحفظ!");
    } finally {
      setSaveLoading(false);
    }
  };

  // Services Management handlers
  const handleAddNewService = () => {
    setEditingServiceId("new");
    setServiceForm({
      titleAr: "",
      titleEn: "",
      descAr: "",
      descEn: "",
      subtitleAr: "",
      subtitleEn: "",
      icon: "Sparkles"
    });
  };

  const handleEditService = (service: any) => {
    setEditingServiceId(service.id);
    setServiceForm({
      titleAr: service.titleAr || "",
      titleEn: service.titleEn || "",
      descAr: service.descAr || "",
      descEn: service.descEn || "",
      subtitleAr: service.subtitleAr || "",
      subtitleEn: service.subtitleEn || "",
      icon: service.icon || "Sparkles"
    });
  };

  const handleDeleteService = (id: string) => {
    if (confirm(isRtl ? "هل أنت متأكد من رغبتك بحذف هذه الخدمة؟" : "Are you sure you want to delete this service?")) {
      const filtered = services.filter(s => s.id !== id);
      setServices(filtered);
    }
  };

  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServiceId === "new") {
      const newId = "serv_" + Date.now();
      setServices([...services, { id: newId, ...serviceForm }]);
    } else if (editingServiceId) {
      const updated = services.map(s => s.id === editingServiceId ? { ...s, ...serviceForm } : s);
      setServices(updated);
    }
    setEditingServiceId(null);
  };

  // Portfolio Management handlers
  const handleAddNewPortfolio = () => {
    setEditingPortfolioId("new");
    setPortfolioForm({
      titleAr: "",
      titleEn: "",
      descAr: "",
      descEn: "",
      category: "outdoor",
      tagAr: "لوحات طرقية",
      tagEn: "Outdoor Billboard",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      statAr: "+1M مشاهدة",
      statEn: "+1M Views",
      clientAr: "عميل محلي",
      clientEn: "Local Client",
      year: "2026",
      detailsAr: "",
      detailsEn: ""
    });
  };

  const handleEditPortfolio = (item: any) => {
    setEditingPortfolioId(item.id);
    setPortfolioForm({
      titleAr: item.titleAr || "",
      titleEn: item.titleEn || "",
      descAr: item.descAr || "",
      descEn: item.descEn || "",
      category: item.category || "outdoor",
      tagAr: item.tagAr || "لوحة طرقية",
      tagEn: item.tagEn || "Outdoor Billboard",
      image: item.image || "",
      statAr: item.statAr || "",
      statEn: item.statEn || "",
      clientAr: item.clientAr || "",
      clientEn: item.clientEn || "",
      year: item.year || "2026",
      detailsAr: item.detailsAr || "",
      detailsEn: item.detailsEn || ""
    });
  };

  const handleDeletePortfolio = (id: string) => {
    if (confirm(isRtl ? "هل أنت متأكد من رغبتك بحذف هذا العمل التسويقي؟" : "Are you sure you want to delete this portfolio item?")) {
      const filtered = portfolioItems.filter(p => p.id !== id);
      setPortfolioItems(filtered);
    }
  };

  const handleSavePortfolioForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPortfolioId === "new") {
      const newId = "port_" + Date.now();
      setPortfolioItems([...portfolioItems, { id: newId, ...portfolioForm }]);
    } else if (editingPortfolioId) {
      const updated = portfolioItems.map(p => p.id === editingPortfolioId ? { ...p, ...portfolioForm } : p);
      setPortfolioItems(updated);
    }
    setEditingPortfolioId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-dark/95 backdrop-blur-xl flex flex-col text-right">
      
      {/* 1. Header of the Dashboard overlay */}
      <header className="border-b border-white/10 bg-brand-slate py-4 px-6 sticky top-0 z-30 flex justify-between items-center flex-row-reverse">
        
        <div className="flex items-center gap-3">
          <button
            id="close-admin-dash"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
            title={isRtl ? "إغلاق والمعاينة" : "Close and Preview"}
          >
            <X size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-widest leading-none">
              {isRtl ? "بوابة إدارة محتوى التا" : "Alta Webmaster Gateway"}
            </span>
            <span className="text-[10px] text-brand-orange font-bold uppercase mt-1">
              {isRtl ? "لوحة تحكم احترافية كاملة" : "Dynamic CMS Administration"}
            </span>
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-4">
            {/* Quick deployment indicator and save trigger */}
            <div className="flex items-center gap-2">
              <button
                id="btn-save-all-config"
                disabled={saveLoading}
                onClick={handleSaveAllConfig}
                className="px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-brand-orange/30 transition hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                {saveLoading ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                <span>{isRtl ? "حفظ وتعميم التعديلات فوراً" : "Deploy Changes Now"}</span>
              </button>
            </div>

            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="px-3 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">{isRtl ? "خروج" : "Logout"}</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. Authentication View (If not logged in) */}
      {!isLoggedIn ? (
        <div className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-brand-slate border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-brand-orange/20 animate-pulse">
                {theme.logoLetter}
              </div>
              <h2 className="text-xl font-black text-white">{isRtl ? "تسجيل دخول لوحة التحكم" : "Administrator Sign In"}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {isRtl ? "يرجى إدخال بيانات المشرف لإدارة وتحديث محتوى وكالة التا للإعلان مباشرة." : "Enter supervisor credentials to perform live updates."}
              </p>
              <div className="text-[10px] text-brand-gold bg-brand-orange/10 border border-brand-orange/15 px-3 py-1.5 rounded-lg inline-block font-mono">
                {isRtl ? "الافتراضي مبدئياً: admin / admin" : "Default: admin / admin"}
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 flex items-center gap-2 flex-row-reverse text-right">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? "اسم المستخدم للمشرف" : "Username"}</label>
                <input
                  id="admin-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? "كلمة المرور الخاصة بالإدارة" : "Password"}</label>
                <input
                  id="admin-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-xs"
                />
              </div>

              <button
                id="admin-login-submit"
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-brand-orange/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loginLoading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>{isRtl ? "تسجيل الدخول الآمن" : "Unlock Dashboard"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        
        // 3. Authenticated Dashboard workspace
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8 items-start">
          
          {/* Notification Alerts */}
          {(actionSuccess || actionError) && (
            <div className="lg:col-span-12">
              {actionSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-400 flex items-center gap-3 flex-row-reverse">
                  <Check size={18} className="flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-400 flex items-center gap-3 flex-row-reverse">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>
          )}

          {/* Left Side: Navigation Links & Admin Controls */}
          <div className="lg:col-span-3 bg-brand-slate border border-white/10 rounded-2xl p-4 space-y-2 flex flex-col">
            
            <div className="px-3 py-2 mb-2 border-b border-white/5 pb-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{isRtl ? "تبويبات الإعدادات والتحكم" : "CONTROL SECTIONS"}</span>
            </div>

            <button
              id="tab-btn-branding"
              onClick={() => setActiveTab("branding")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right flex-row-reverse ${
                activeTab === "branding" 
                  ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/10" 
                  : "text-gray-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Palette size={15} />
              <span className="flex-grow">{isRtl ? "الألوان البصرية والشعار" : "Theme & Brand Settings"}</span>
            </button>

            <button
              id="tab-btn-texts"
              onClick={() => setActiveTab("texts")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right flex-row-reverse ${
                activeTab === "texts" 
                  ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/10" 
                  : "text-gray-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <FileText size={15} />
              <span className="flex-grow">{isRtl ? "تعديل كتابات ونصوص الموقع" : "Website Translation Texts"}</span>
            </button>

            <button
              id="tab-btn-services"
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right flex-row-reverse ${
                activeTab === "services" 
                  ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/10" 
                  : "text-gray-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Layout size={15} />
              <span className="flex-grow">{isRtl ? "إدارة الخدمات الأساسية" : "Service Directory CMS"}</span>
            </button>

            <button
              id="tab-btn-portfolio"
              onClick={() => setActiveTab("portfolio")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right flex-row-reverse ${
                activeTab === "portfolio" 
                  ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/10" 
                  : "text-gray-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Briefcase size={15} />
              <span className="flex-grow">{isRtl ? "معرض الأعمال والتسويق" : "Portfolio Masterpieces"}</span>
            </button>

            <button
              id="tab-btn-security"
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right flex-row-reverse ${
                activeTab === "security" 
                  ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/10" 
                  : "text-gray-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Lock size={15} />
              <span className="flex-grow">{isRtl ? "أمان المشرف وباسورد جديد" : "Security & Password"}</span>
            </button>

            <div className="pt-4 mt-4 border-t border-white/5 px-3">
              <button
                id="btn-deploy-cms"
                onClick={handleSaveAllConfig}
                disabled={saveLoading}
                className="w-full py-2.5 bg-brand-orange text-white rounded-lg text-xs font-bold shadow hover:bg-brand-orange-light transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saveLoading ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                <span>{isRtl ? "حفظ وتعميم التغييرات" : "Save Changes"}</span>
              </button>
            </div>

          </div>

          {/* Right Side: Tab Work Area */}
          <div className="lg:col-span-9 bg-brand-slate border border-white/10 rounded-2xl p-6 space-y-6">
            
            {/* TAB 1: BRANDING AND COLORS */}
            {activeTab === "branding" && (
              <div className="space-y-6 text-right">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-lg font-black text-white">{isRtl ? "الهوية البصرية والألوان الرئيسية" : "Branding Aesthetics & Identity colors"}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRtl ? "تعديل ألوان الثيم وتصميم الشعار اللفظي المعتمد في كامل صفحات الموقع مباشرة." : "Adjust theme accent colors and logo variables immediately."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Color Picker */}
                  <div className="bg-brand-dark/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-gray-300">{isRtl ? "اللون الرئيسي للموقع (Primary Orange)" : "Primary Website Color"}</label>
                    <div className="flex gap-3 items-center flex-row-reverse">
                      <input
                        id="color-picker-primary"
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer"
                      />
                      <input
                        id="color-hex-primary"
                        type="text"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="flex-grow bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Secondary Color Picker */}
                  <div className="bg-brand-dark/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-gray-300">{isRtl ? "اللون المساعد للموقع (Secondary Gold)" : "Secondary Accent Color"}</label>
                    <div className="flex gap-3 items-center flex-row-reverse">
                      <input
                        id="color-picker-secondary"
                        type="color"
                        value={theme.secondaryColor}
                        onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                        className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer"
                      />
                      <input
                        id="color-hex-secondary"
                        type="text"
                        value={theme.secondaryColor}
                        onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                        className="flex-grow bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Logo Letter */}
                  <div className="bg-brand-dark/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-gray-300">{isRtl ? "الحرف المكتوب بمركز الشعار (Logo Symbol)" : "Logo Symbolic Character"}</label>
                    <input
                      id="logo-symbol-input"
                      type="text"
                      maxLength={3}
                      value={theme.logoLetter}
                      onChange={(e) => setTheme({ ...theme, logoLetter: e.target.value })}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none text-center font-bold"
                    />
                  </div>

                  {/* Brand Titles */}
                  <div className="bg-brand-dark/40 border border-white/5 p-4 rounded-xl space-y-4 md:col-span-2">
                    <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">{isRtl ? "عنوان العلامة التجارية" : "Brand Identity Name"}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-2">{isRtl ? "الاسم العربي" : "Arabic Brand Title"}</label>
                        <input
                          id="logo-name-ar-input"
                          type="text"
                          value={theme.logoNameAr}
                          onChange={(e) => setTheme({ ...theme, logoNameAr: e.target.value })}
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-2">{isRtl ? "الاسم الإنكليزي" : "English Brand Title"}</label>
                        <input
                          id="logo-name-en-input"
                          type="text"
                          value={theme.logoNameEn}
                          onChange={(e) => setTheme({ ...theme, logoNameEn: e.target.value })}
                          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-orange/5 border border-brand-orange/15 rounded-xl flex items-start gap-3 flex-row-reverse">
                  <Sparkles size={16} className="text-brand-orange flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {isRtl 
                      ? "سيتم تطبيق هذه الألوان فوراً عبر متغيرات CSS مخصصة، مما يعدل ألوان الهيدر والأزرار وحالة الأكتيف تلقائياً في كامل الصفحة دون الحاجة لإعادة تنزيل الموقع."
                      : "These values populate custom CSS properties on document elements. All visual components will adjust live."}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT TEXTS AND TRANSLATIONS */}
            {activeTab === "texts" && (
              <div className="space-y-6 text-right">
                <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-row-reverse">
                  <div>
                    <h3 className="text-lg font-black text-white">{isRtl ? "تعديل كتابات ونصوص الموقع" : "Website Texts & Localization"}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRtl ? "عدل أي فقرة أو عنوان في الموقع اللغتين العربية والإنكليزية بمرونة كاملة." : "Update any block of writing on the page easily."}
                    </p>
                  </div>
                  
                  {/* Select Language toggle */}
                  <div className="flex gap-1.5 bg-brand-dark/80 p-1 rounded-xl border border-white/10">
                    <button
                      id="text-edit-lang-ar"
                      onClick={() => setTextLangToEdit("ar")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        textLangToEdit === "ar" ? "bg-brand-orange text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      العربية
                    </button>
                    <button
                      id="text-edit-lang-en"
                      onClick={() => setTextLangToEdit("en")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        textLangToEdit === "en" ? "bg-brand-orange text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Grid of editable translatable labels */}
                <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2">
                  {Object.keys(textLangToEdit === "ar" ? translationsAr : translationsEn).map((key) => {
                    // Group similar or skip internal arrays if any
                    const val = textLangToEdit === "ar" ? translationsAr[key] : translationsEn[key];
                    if (typeof val !== "string") return null;

                    return (
                      <div key={key} className="bg-brand-dark/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                        <div className="flex justify-between flex-row-reverse text-xs">
                          <span className="font-mono text-[10px] text-brand-gold">{key}</span>
                          <span className="text-gray-400">{isRtl ? "النص المعروض" : "Displayed String"}</span>
                        </div>
                        {val.length > 80 ? (
                          <textarea
                            id={`text-input-${key}`}
                            rows={3}
                            value={val}
                            onChange={(e) => {
                              if (textLangToEdit === "ar") {
                                setTranslationsAr({ ...translationsAr, [key]: e.target.value });
                              } else {
                                setTranslationsEn({ ...translationsEn, [key]: e.target.value });
                              }
                            }}
                            className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white text-xs leading-relaxed focus:outline-none"
                          />
                        ) : (
                          <input
                            id={`text-input-${key}`}
                            type="text"
                            value={val}
                            onChange={(e) => {
                              if (textLangToEdit === "ar") {
                                setTranslationsAr({ ...translationsAr, [key]: e.target.value });
                              } else {
                                setTranslationsEn({ ...translationsEn, [key]: e.target.value });
                              }
                            }}
                            className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SERVICES MANAGEMENT */}
            {activeTab === "services" && (
              <div className="space-y-6 text-right">
                <div className="border-b border-white/5 pb-4 flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-lg font-black text-white">{isRtl ? "إدارة الخدمات الإعلانية" : "Manage Advertising Services"}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRtl ? "إضافة خدمات جديدة للوكالة أو تعديل وحذف الخدمات المتوفرة." : "Configure core services displayed on the public page."}
                    </p>
                  </div>
                  
                  {editingServiceId === null && (
                    <button
                      id="btn-add-service"
                      onClick={handleAddNewService}
                      className="px-3 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>{isRtl ? "إضافة خدمة جديدة" : "Add Service"}</span>
                    </button>
                  )}
                </div>

                {/* Service Form Editor (If editingServiceId !== null) */}
                {editingServiceId !== null ? (
                  <form onSubmit={handleSaveServiceForm} className="bg-brand-dark/40 border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 flex-row-reverse">
                      <h4 className="text-sm font-bold text-brand-orange">
                        {editingServiceId === "new" 
                          ? (isRtl ? "إضافة خدمة جديدة كلياً" : "Add New Service Details") 
                          : (isRtl ? "تعديل تفاصيل الخدمة" : "Edit Service Details")}
                      </h4>
                      <button
                        id="cancel-service-edit"
                        type="button"
                        onClick={() => setEditingServiceId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Arabic fields */}
                      <div className="space-y-3 bg-brand-dark/50 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-brand-gold font-bold block">العربية</span>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">اسم الخدمة بالكامل</label>
                          <input
                            id="service-title-ar"
                            type="text"
                            required
                            value={serviceForm.titleAr}
                            onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">شرح موجز مختصر</label>
                          <textarea
                            id="service-desc-ar"
                            rows={3}
                            required
                            value={serviceForm.descAr}
                            onChange={(e) => setServiceForm({ ...serviceForm, descAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">شريط أسفل البطاقة (مثال: الشوارع الكبرى)</label>
                          <input
                            id="service-sub-ar"
                            type="text"
                            value={serviceForm.subtitleAr}
                            onChange={(e) => setServiceForm({ ...serviceForm, subtitleAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* English fields */}
                      <div className="space-y-3 bg-brand-dark/50 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-brand-gold font-bold block">English</span>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Service Title</label>
                          <input
                            id="service-title-en"
                            type="text"
                            required
                            value={serviceForm.titleEn}
                            onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Service Description</label>
                          <textarea
                            id="service-desc-en"
                            rows={3}
                            required
                            value={serviceForm.descEn}
                            onChange={(e) => setServiceForm({ ...serviceForm, descEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Footer Subtitle (e.g., Key spots)</label>
                          <input
                            id="service-sub-en"
                            type="text"
                            value={serviceForm.subtitleEn}
                            onChange={(e) => setServiceForm({ ...serviceForm, subtitleEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Icon selection */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{isRtl ? "رمز الأيقونة (من مكتبة Lucide)" : "Lucide Icon Slug"}</label>
                        <select
                          id="service-icon"
                          value={serviceForm.icon}
                          onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                          className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                        >
                          <option value="Map">Map (خرائط وبيلبورد)</option>
                          <option value="Sparkles">Sparkles (تألق ورقمنة)</option>
                          <option value="Layers">Layers (هوية بصرية وطبقات)</option>
                          <option value="Tv">Tv (سينمائي وإنتاج فني)</option>
                        </select>
                      </div>

                      <div className="flex gap-2.5 justify-end pt-5">
                        <button
                          id="service-cancel-btn"
                          type="button"
                          onClick={() => setEditingServiceId(null)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition"
                        >
                          {isRtl ? "إلغاء التراجع" : "Cancel"}
                        </button>
                        <button
                          id="service-save-btn"
                          type="submit"
                          className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-lg text-xs font-bold transition"
                        >
                          {isRtl ? "حفظ وتثبيت الخدمة" : "Save Service"}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Services list */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((item) => (
                      <div key={item.id} className="bg-brand-dark/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start flex-row-reverse">
                            <span className="text-[10px] text-brand-gold font-mono uppercase font-bold">{item.icon}</span>
                            <div className="flex gap-1">
                              <button
                                id={`edit-service-${item.id}`}
                                onClick={() => handleEditService(item)}
                                className="p-1 text-gray-400 hover:text-brand-orange"
                                title="تعديل الخدمة"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                id={`delete-service-${item.id}`}
                                onClick={() => handleDeleteService(item.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                                title="حذف الخدمة"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-1 mt-2 text-right">
                            <h4 className="text-sm font-bold text-white">{item.titleAr}</h4>
                            <p className="text-[11px] text-gray-500 font-sans">{item.titleEn}</p>
                            <p className="text-xs text-gray-400 leading-relaxed mt-2 line-clamp-2">{item.descAr}</p>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-2 mt-3 text-right">
                          <span className="text-[10px] text-brand-orange font-bold">{item.subtitleAr || "ـ"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PORTFOLIO MANAGEMENT */}
            {activeTab === "portfolio" && (
              <div className="space-y-6 text-right">
                <div className="border-b border-white/5 pb-4 flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-lg font-black text-white">{isRtl ? "إدارة معرض روائع الأعمال" : "Manage Marketing Portfolio"}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRtl ? "إضافة أعمال إعلانية ناجحة جديدة أو تعديل وحذف الأعمال الحالية." : "Control visual success studies displayed in showcase galleries."}
                    </p>
                  </div>
                  
                  {editingPortfolioId === null && (
                    <button
                      id="btn-add-portfolio"
                      onClick={handleAddNewPortfolio}
                      className="px-3 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>{isRtl ? "إضافة عمل إبداعي جديد" : "Add Work"}</span>
                    </button>
                  )}
                </div>

                {/* Portfolio Form Editor */}
                {editingPortfolioId !== null ? (
                  <form onSubmit={handleSavePortfolioForm} className="bg-brand-dark/40 border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 flex-row-reverse">
                      <h4 className="text-sm font-bold text-brand-orange">
                        {editingPortfolioId === "new" 
                          ? (isRtl ? "إضافة بورتفوليو جديد" : "Add New Success Study") 
                          : (isRtl ? "تعديل تفاصيل البورتفوليو" : "Edit Success Study")}
                      </h4>
                      <button
                        id="cancel-portfolio-edit"
                        type="button"
                        onClick={() => setEditingPortfolioId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Arabic fields */}
                      <div className="space-y-3 bg-brand-dark/50 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-brand-gold font-bold block">العربية</span>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">اسم العمل الإعلاني</label>
                          <input
                            id="portfolio-title-ar"
                            type="text"
                            required
                            value={portfolioForm.titleAr}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, titleAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">وصف مختصر</label>
                          <textarea
                            id="portfolio-desc-ar"
                            rows={2}
                            required
                            value={portfolioForm.descAr}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, descAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">تفاصيل الرؤية الإبداعية والتنفيذ</label>
                          <textarea
                            id="portfolio-details-ar"
                            rows={3}
                            required
                            value={portfolioForm.detailsAr}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, detailsAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">العميل</label>
                            <input
                              id="portfolio-client-ar"
                              type="text"
                              value={portfolioForm.clientAr}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, clientAr: e.target.value })}
                              className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">الهاشتاغ/التاغ</label>
                            <input
                              id="portfolio-tag-ar"
                              type="text"
                              value={portfolioForm.tagAr}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, tagAr: e.target.value })}
                              className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">إحصائية النجاح (الأثر)</label>
                          <input
                            id="portfolio-stat-ar"
                            type="text"
                            value={portfolioForm.statAr}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, statAr: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* English fields */}
                      <div className="space-y-3 bg-brand-dark/50 p-4 rounded-xl border border-white/5 text-left font-sans">
                        <span className="text-[10px] text-brand-gold font-bold block text-right">English</span>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 text-right">Campaign/Work Title</label>
                          <input
                            id="portfolio-title-en"
                            type="text"
                            required
                            value={portfolioForm.titleEn}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, titleEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none text-left"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 text-right">Short Description</label>
                          <textarea
                            id="portfolio-desc-en"
                            rows={2}
                            required
                            value={portfolioForm.descEn}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, descEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none text-left"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 text-right">Creative Details & Implementation</label>
                          <textarea
                            id="portfolio-details-en"
                            rows={3}
                            required
                            value={portfolioForm.detailsEn}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, detailsEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none text-left"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1 text-right">Client Name</label>
                            <input
                              id="portfolio-client-en"
                              type="text"
                              value={portfolioForm.clientEn}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, clientEn: e.target.value })}
                              className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1 text-right">Category Tag</label>
                            <input
                              id="portfolio-tag-en"
                              type="text"
                              value={portfolioForm.tagEn}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, tagEn: e.target.value })}
                              className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none text-left"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 text-right">Impact ROI statistic</label>
                          <input
                            id="portfolio-stat-en"
                            type="text"
                            value={portfolioForm.statEn}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, statEn: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none text-left font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shared params (category, year, image URL) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{isRtl ? "تصنيف القسم" : "Category Channel"}</label>
                        <select
                          id="portfolio-category"
                          value={portfolioForm.category}
                          onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                          className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                        >
                          <option value="outdoor">Outdoor (لوحة طرقية)</option>
                          <option value="branding">Branding (هوية بصرية)</option>
                          <option value="digital">Digital (حملة رقمية)</option>
                          <option value="video">Video (إنتاج سينمائي)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{isRtl ? "عام الإطلاق" : "Release Year"}</label>
                        <input
                          id="portfolio-year"
                          type="text"
                          required
                          value={portfolioForm.year}
                          onChange={(e) => setPortfolioForm({ ...portfolioForm, year: e.target.value })}
                          className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{isRtl ? "رابط الصورة الإعلانية" : "Creative Image URL"}</label>
                        <input
                          id="portfolio-image"
                          type="text"
                          required
                          value={portfolioForm.image}
                          onChange={(e) => setPortfolioForm({ ...portfolioForm, image: e.target.value })}
                          className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 justify-end pt-4 border-t border-white/5">
                      <button
                        id="portfolio-cancel-btn"
                        type="button"
                        onClick={() => setEditingPortfolioId(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition"
                      >
                        {isRtl ? "إلغاء التراجع" : "Cancel"}
                      </button>
                      <button
                        id="portfolio-save-btn"
                        type="submit"
                        className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-lg text-xs font-bold transition"
                      >
                        {isRtl ? "حفظ وتثبيت العمل" : "Save Showcase Item"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Portfolio items lists */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="bg-brand-dark/40 border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between">
                        <div className="relative aspect-video bg-black">
                          <img
                            src={item.image}
                            alt={item.titleAr}
                            className="w-full h-full object-cover opacity-65"
                          />
                          <span className="absolute top-2 right-2 bg-brand-dark/80 text-brand-orange text-[9px] px-2 py-1 rounded border border-white/10">
                            {item.tagAr}
                          </span>
                        </div>

                        <div className="p-4 space-y-2 text-right">
                          <div className="flex justify-between items-start flex-row-reverse">
                            <h4 className="text-sm font-bold text-white line-clamp-1">{item.titleAr}</h4>
                            <div className="flex gap-1">
                              <button
                                id={`edit-portfolio-${item.id}`}
                                onClick={() => handleEditPortfolio(item)}
                                className="p-1 text-gray-400 hover:text-brand-orange"
                                title="تعديل العمل"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                id={`delete-portfolio-${item.id}`}
                                onClick={() => handleDeletePortfolio(item.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                                title="حذف العمل"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 font-sans line-clamp-1">{item.titleEn}</p>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.descAr}</p>
                        </div>

                        <div className="bg-brand-dark/20 px-4 py-2 border-t border-white/5 flex justify-between text-[10px] text-gray-500 font-mono">
                          <span>{item.year}</span>
                          <span>{item.statAr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SECURITY AND PASSWORD UPDATE */}
            {activeTab === "security" && (
              <div className="space-y-6 text-right">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-lg font-black text-white">{isRtl ? "أمان المشرف وتغيير كلمة المرور" : "Gateway Security & Credentials"}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRtl ? "قم بتعديل كلمة المرور السرية لضمان عدم إمكانية دخول الغرباء وتعديل محتوى موقع التا." : "Update supervisor password to secure CMS."}
                  </p>
                </div>

                {securitySuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-400 flex items-center gap-3 flex-row-reverse text-right">
                    <Check size={18} className="flex-shrink-0" />
                    <span>{securitySuccess}</span>
                  </div>
                )}

                {securityError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-400 flex items-center gap-3 flex-row-reverse text-right">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChangeSubmit} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? "كلمة المرور الحالية" : "Current Password"}</label>
                    <input
                      id="security-old-password"
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? "كلمة المرور الجديدة" : "New Secure Password"}</label>
                    <input
                      id="security-new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">{isRtl ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</label>
                    <input
                      id="security-confirm-password"
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition text-xs"
                    />
                  </div>

                  <button
                    id="security-password-submit"
                    type="submit"
                    disabled={securityLoading || !oldPassword || !newPassword || !confirmNewPassword}
                    className="py-3 px-6 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs uppercase shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {securityLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>{isRtl ? "تعديل كلمة المرور وتحديثها" : "Save Secure Credentials"}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
