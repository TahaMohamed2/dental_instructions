const i18n = {
  currentLang: localStorage.getItem('lang') || 'ar',

  init() {
    this.setLanguage(this.currentLang);
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-lang', lang);
    
    // Dispatch event so other scripts can re-render if needed
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    this.updateStaticUI();
  },

  getLanguage() {
    return this.currentLang;
  },

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'ar' ? 'en' : 'ar');
  },
  
  updateStaticUI() {
    const isAr = this.currentLang === 'ar';
    document.querySelectorAll('.ar-only').forEach(el => {
      el.style.display = isAr ? '' : 'none';
    });
    document.querySelectorAll('.en-only').forEach(el => {
      el.style.display = isAr ? 'none' : '';
    });
    
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.textContent = isAr ? 'English' : 'عربي';
    }
    
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
       homeBtn.textContent = isAr ? 'الرئيسية' : 'Home';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => i18n.init());
window.i18n = i18n;
