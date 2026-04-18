document.addEventListener('DOMContentLoaded', async () => {
    // Check if running on file:// protocol
    if (window.location.protocol === 'file:') {
        console.error("Fetch API does not work with the file:// protocol. Please use a local web server (e.g., Live Server in VS Code, or 'python -m http.server').");
        const main = document.getElementById('page-content') || document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="bg-red-900/50 border border-red-500 text-white p-6 rounded-lg text-center mt-10">
                    <h2 class="text-2xl font-bold mb-2">Browser Security Restriction</h2>
                    <p class="mb-4">The dynamic data cannot be loaded because you are opening the file directly from your computer (file://).</p>
                    <p class="text-sm bg-black/30 p-3 rounded">To view the site correctly, please use a <strong>Local Web Server</strong> (e.g., VS Code Live Server extension).</p>
                </div>
            `;
        }
        return;
    }

    try {
        console.log("Fetching site data...");
        
        // CHECK FOR PREVIEW MODE
        const isPreview = sessionStorage.getItem('preview_mode') === 'true';
        let clinicData, instructionsData, portfolioData, servicesData;

        if (isPreview) {
            console.log("RUNNING IN PREVIEW MODE");
            clinicData = JSON.parse(sessionStorage.getItem('preview_clinic'));
            instructionsData = JSON.parse(sessionStorage.getItem('preview_instructions'));
            portfolioData = JSON.parse(sessionStorage.getItem('preview_portfolio'));
            servicesData = JSON.parse(sessionStorage.getItem('preview_services'));
            
            if (!portfolioData) {
                const pRes = await fetch('data/portfolio_template.json');
                portfolioData = await pRes.json();
            }
            if (!servicesData) {
                const sRes = await fetch('data/services_template.json');
                servicesData = await sRes.json();
            }
        } else {
            const [clinicRes, instructionsRes, portfolioRes, servicesRes] = await Promise.all([
                fetch('data/clinic.json'),
                fetch('data/instructions.json'),
                fetch('data/portfolio.json'),
                fetch('data/services.json')
            ]);
            
            if (!clinicRes.ok || !instructionsRes.ok || !portfolioRes.ok || !servicesRes.ok) {
                throw new Error("Failed to load clinical datasets.");
            }

            clinicData = await clinicRes.json();
            instructionsData = await instructionsRes.json();
            portfolioData = await portfolioRes.json();
            servicesData = await servicesRes.json();
        }
        
        window.clinicData = clinicData;
        window.instructionsData = instructionsData;
        window.portfolioData = portfolioData;
        window.servicesData = servicesData;
        
        applyClinicBranding(clinicData);
        renderSharedComponents(clinicData);
        
        const pageId = document.body.dataset.page;
        handlePageRouting(pageId);
        
        // Add a "Exit Preview" banner if in preview mode
        if (isPreview) {
            const banner = document.createElement('div');
            banner.innerHTML = `
                <div class="fixed top-0 left-0 w-full bg-teal-500 text-slate-900 py-2 px-4 text-center font-bold text-xs z-[9999] shadow-xl flex justify-center items-center gap-4">
                    <span>DEMO MODE: Viewing your custom clinic configuration</span>
                    <button onclick="sessionStorage.clear(); window.location.reload();" class="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">Exit Preview</button>
                    <button onclick="window.location.href='onboarding.html'" class="bg-white/20 text-slate-900 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-slate-900/20 font-black">Back to Builder</button>
                </div>
            `;
            document.body.appendChild(banner);
            document.body.style.paddingTop = '40px';
        }
        
        // Listen for language change to re-render
        window.addEventListener('languageChanged', () => {
             const lang = window.i18n.getLanguage();
             document.title = lang === 'ar' ? clinicData.clinic_name_ar : clinicData.clinic_name_en;
             handlePageRouting(pageId);
        });

    } catch (e) {
        console.error("Failed to load site data:", e);
        const main = document.getElementById('page-content') || document.querySelector('main');
        if (main) {
            main.innerHTML = `<div class="text-center p-10"><p class="text-red-400">Error loading data: ${e.message}</p><p class="text-sm mt-2">Check console for details.</p></div>`;
        }
    }
});

function applyClinicBranding(clinic) {
    const root = document.documentElement;
    if (clinic.theme) {
        if(clinic.theme.primary_color) root.style.setProperty('--color-primary', clinic.theme.primary_color);
        if(clinic.theme.accent_color) root.style.setProperty('--color-accent', clinic.theme.accent_color);
        if(clinic.theme.font_ar) root.style.setProperty('--font-ar', `"${clinic.theme.font_ar}", sans-serif`);
        if(clinic.theme.font_en) root.style.setProperty('--font-en', `"${clinic.theme.font_en}", sans-serif`);
        
        if(clinic.theme.background_image) {
            document.body.style.backgroundImage = `url(${clinic.theme.background_image})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundRepeat = 'no-repeat';
        }
    }
    const lang = window.i18n ? window.i18n.getLanguage() : 'ar';
    document.title = lang === 'ar' ? clinic.clinic_name_ar : clinic.clinic_name_en;
}

function renderSharedComponents(clinic) {
    // We expect header/footer to be empty in the HTML, we populate them here
    const header = document.getElementById('site-header');
    if (header) {
        header.className = "flex justify-between items-center mb-8 pb-4 border-b border-slate-600";
        header.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${clinic.logo}" alt="Logo" class="h-12 w-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity" onclick="window.location.href='index.html'" onerror="this.style.display='none'">
                <div class="hidden sm:block">
                    <h1 class="text-xl font-bold text-white leading-tight">
                       <span class="ar-only">${clinic.clinic_name_ar}</span>
                       <span class="en-only" style="display:none;">${clinic.clinic_name_en}</span>
                    </h1>
                </div>
            </div>
            
            <nav class="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-2">
                 <a href="index.html" class="nav-link text-xs md:text-sm text-slate-300 hover:text-white transition-colors"><span class="ar-only">الرئيسية</span><span class="en-only" style="display:none;">Home</span></a>
                 ${(!clinic.enabled_features || clinic.enabled_features.schedule) ? `<a href="clinic_schedule.html" class="nav-link text-xs md:text-sm text-slate-300 hover:text-white transition-colors"><span class="ar-only">المواعيد</span><span class="en-only" style="display:none;">Schedule</span></a>` : ''}
                 ${(!clinic.enabled_features || clinic.enabled_features.services) ? `<a href="clinic_services.html" class="nav-link text-xs md:text-sm text-slate-300 hover:text-white transition-colors"><span class="ar-only">الخدمات</span><span class="en-only" style="display:none;">Services</span></a>` : ''}
                 ${(!clinic.enabled_features || clinic.enabled_features.portfolio) ? `<a href="portfolio.html" class="nav-link text-xs md:text-sm text-slate-300 hover:text-white transition-colors"><span class="ar-only">سابقة الأعمال</span><span class="en-only" style="display:none;">Portfolio</span></a>` : ''}
            </nav>

            <div class="flex items-center gap-2">
                <button id="lang-toggle-btn" class="bg-slate-700/50 hover:bg-slate-600 text-slate-100 text-[10px] md:text-xs border border-slate-600 rounded-lg px-2 md:px-3 py-1.5 transition-all shadow-sm" onclick="window.i18n.toggleLanguage()">English</button>
            </div>
        `;
    }

    const footer = document.getElementById('site-footer');
    if (footer) {
        footer.innerHTML = `
            <div class="mt-auto pt-10 pb-6 text-center text-slate-500 text-xs border-t border-slate-700 w-full">
                <p class="mb-2">© ${new Date().getFullYear()} ${clinic.clinic_name_ar}</p>
                <div class="flex justify-center gap-4 mb-4">
                    <a href="credits.html" class="hover:text-slate-300 transition-colors uppercase tracking-widest">Credits</a>
                    ${clinic.socials && clinic.socials.facebook ? `<a href="${clinic.socials.facebook}" target="_blank" class="hover:text-slate-300 transition-colors font-bold uppercase tracking-widest text-[#1877F2]">Facebook</a>` : ''}
                    ${clinic.socials && clinic.socials.instagram ? `<a href="${clinic.socials.instagram}" target="_blank" class="hover:text-slate-300 transition-colors font-bold uppercase tracking-widest text-[#E4405F]">Instagram</a>` : ''}
                    ${clinic.socials && clinic.socials.linkedin ? `<a href="${clinic.socials.linkedin}" target="_blank" class="hover:text-slate-300 transition-colors font-bold uppercase tracking-widest text-[#0A66C2]">LinkedIn</a>` : ''}
                    ${clinic.email ? `<a href="mailto:${clinic.email}" class="hover:text-slate-300 transition-colors font-bold uppercase tracking-widest">Email</a>` : ''}
                </div>
                <!-- Visitor Counter -->
                <div class="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
                    <script type="text/javascript" src="https://www.freevisitorcounters.com/en/home/counter/1383806/t/10"></script>
                </div>
            </div>
            
            <!-- Global Floating UI -->
            <div class="fixed bottom-5 left-5 flex flex-col gap-3 z-50">
                 <button onclick="viewQRImage()" class="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 rounded-full p-2 transition-all shadow-xl active:scale-95 w-12 h-12 flex items-center justify-center overflow-hidden">
                    <img src="resources/QR.jpeg" alt="QR" class="w-full h-full object-cover">
                 </button>
            </div>
        `;
    }
    
    // update display initially
    if(window.i18n) window.i18n.updateStaticUI();
}

function handlePageRouting(pageId) {
    if (!pageId) return;

    if (window.instructionsData[pageId]) {
        renderInstructionPage(window.instructionsData[pageId]);
    } else if (pageId === 'services' && window.servicesData) {
        renderServices(window.servicesData);
    } else if (pageId === 'portfolio' && window.portfolioData) {
        renderPortfolio(window.portfolioData);
    } else if (pageId === 'schedule' && window.clinicData && window.clinicData.schedule) {
        renderSchedule(window.clinicData.schedule);
    } else if (pageId === 'credits') {
        renderCredits();
    }
}

function renderInstructionPage(pageData) {
    const main = document.getElementById('page-content');
    if (!main) return;
    
    const lang = window.i18n ? window.i18n.getLanguage() : 'ar';
    const title = lang === 'ar' ? pageData.title_ar : (pageData.title_en || pageData.title_ar);
    
    let html = `<h1 class="text-3xl md:text-4xl font-bold text-center mb-8 text-white">${title}</h1>`;
    
    if (pageData.sections) {
        pageData.sections.forEach(section => {
            const h = lang === 'ar' ? section.heading_ar : (section.heading_en || section.heading_ar);
            if (h) {
                html += `<h2 class="text-2xl font-semibold mb-4 mt-6 text-white border-r-4 border-teal-500 pr-3">${h}</h2>`;
            }
            
            if (section.type === 'list' && section.items_ar) {
                const items = lang === 'ar' ? section.items_ar : (section.items_en && section.items_en[0] ? section.items_en : section.items_ar);
                html += `<ul class="list-disc list-inside mb-6 space-y-3 text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl">`;
                items.forEach(item => {
                    if (item.trim() === "طريقة غسيل الاسنان" || item.trim() === "How to brush teeth") {
                        html += `<li class="list-none my-4">
                            <button onclick="window.location.href='brushing.html'" class="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg active:scale-95">
                                <img src="resources/button_brushing.webp" alt="Brushing" class="w-8 h-8 rounded-full">
                                <span>${lang === 'ar' ? 'طريقة غسيل الاسنان' : 'Interactive Brushing Guide'}</span>
                            </button>
                        </li>`;
                    } else {
                        html += `<li>${item}</li>`;
                    }
                });
                html += `</ul>`;
            }
            
            const paragraphs = lang === 'ar' ? section.paragraphs_ar : (section.paragraphs_en && section.paragraphs_en[0] ? section.paragraphs_en : section.paragraphs_ar);
            if (paragraphs) {
                paragraphs.forEach(p => {
                    html += `<p class="mb-4 text-slate-300 leading-relaxed text-lg">${p}</p>`;
                });
            }

            if (section.type === 'video' && section.video_url) {
                const url = section.video_url.includes('embed') ? section.video_url : section.video_url.replace('watch?v=', 'embed/');
                html += `
                <div class="relative w-full mb-10 pt-[56.25%] overflow-hidden rounded-2xl shadow-2xl border border-white/10 glow-teal">
                    <iframe 
                        class="absolute top-0 left-0 w-full h-full"
                        src="${url}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen>
                    </iframe>
                </div>`;
            }
        });
    }
    
    main.innerHTML = html;
}

function renderServices(data) {
    const main = document.getElementById('page-content');
    if (!main) return;
    const lang = window.i18n ? window.i18n.getLanguage() : 'ar';
    
    let html = `<h1 class="text-3xl md:text-4xl font-bold text-center mb-8 text-white">${lang === 'ar' ? 'خدماتنا' : 'Our Services'}</h1>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">`;
    
    data.services.forEach(service => {
        const title = lang === 'ar' ? service.title_ar : service.title_en;
        html += `
            <div class="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/5 hover:border-teal-500/50 transition-all group">
                <h3 class="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 bg-teal-500 rounded-full group-hover:scale-150 transition-transform"></span>
                    ${title}
                </h3>
                <div class="grid grid-cols-2 gap-2">
        `;
        service.images.forEach(img => {
            html += `<img src="${img}" class="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform" alt="${title}">`;
        });
        html += `</div></div>`;
    });
    
    html += `</div>`;
    main.innerHTML = html;
}

function renderPortfolio(data) {
    const main = document.getElementById('page-content');
    if (!main) return;
    const lang = window.i18n ? window.i18n.getLanguage() : 'ar';
    
    let html = `<h1 class="text-3xl md:text-4xl font-bold text-center mb-12 text-white">${lang === 'ar' ? 'سابقة الأعمال' : 'Clinical Portfolio'}</h1>`;
    
    data.cases.forEach(item => {
        const title = lang === 'ar' ? item.title_ar : item.title_en;
        const desc = lang === 'ar' ? item.description_ar : item.description_en;
        const note = lang === 'ar' ? item.note_ar : item.note_en;
        
        html += `
            <div class="mb-16 bg-slate-700/30 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
                <h2 class="text-2xl font-bold text-teal-300 mb-6 border-b border-teal-500/30 pb-4">${title}</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div class="space-y-4">
                        <p class="text-slate-300 leading-relaxed text-lg text-justify">${desc}</p>
                        ${note ? `<div class="bg-teal-500/10 border-r-4 border-teal-500 p-4 rounded-lg italic text-teal-200">NOTE: ${note}</div>` : ''}
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${item.images.map(img => `<img src="${img}" class="w-full rounded-2xl shadow-lg border border-white/5 hover:scale-[1.02] transition-transform" alt="${title}">`).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    main.innerHTML = html;
}

function renderSchedule(schedule) {
    const main = document.getElementById('page-content');
    if (!main) return;
    const lang = window.i18n ? window.i18n.getLanguage() : 'ar';
    
    const daysAr = { sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت' };
    const daysEn = { sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' };

    let html = `
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">${lang === 'ar' ? 'مواعيد العيادة' : 'Clinic Schedule'}</h1>
            <p class="text-slate-400">${lang === 'ar' ? 'برجاء اختيار اليوم لمشاهدة التفاصيل' : 'Select a day to see clinic details'}</p>
        </div>
        <div class="flex flex-wrap justify-center gap-3 mb-10">
    `;

    Object.keys(schedule).forEach(day => {
        const dayLabel = lang === 'ar' ? daysAr[day] : daysEn[day];
        const colorClass = day === 'friday' ? 'bg-slate-600' : 'bg-teal-600';
        html += `<button onclick="showClinicOnPage('${day}')" class="day-btn ${colorClass} text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">${dayLabel}</button>`;
    });

    html += `</div><div id="schedule-details" class="transition-all duration-500"></div>`;
    main.innerHTML = html;

    window.showClinicOnPage = (day) => {
        const item = schedule[day];
        const container = document.getElementById('schedule-details');
        
        if (!item || (Array.isArray(item) && item.length === 0)) {
            container.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <div class="inline-block p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                        <svg class="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <p class="text-slate-400 font-bold tracking-widest uppercase text-[10px]">
                             ${lang === 'ar' ? 'العيادة مغلقة أو لا يوجد أطباء متاحون' : 'Clinic is closed or no specialists available'}
                        </p>
                    </div>
                </div>
            `;
        } else {
            const specialists = Array.isArray(item) ? item : [item];
            container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 mt-10";
            container.innerHTML = specialists.map(doc => `
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.02] flex flex-col justify-between hover:border-teal-500/30 group">
                    <div>
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center font-bold text-slate-900 text-xl shadow-lg shadow-teal-500/20 group-hover:rotate-6 transition-transform">
                                ${lang === 'ar' ? (doc.doctor_ar || 'د').charAt(0) : (doc.doctor_en || 'D').charAt(0)}
                            </div>
                            <div>
                                <h3 class="text-xl font-black text-white tracking-tighter">${lang === 'ar' ? doc.doctor_ar : doc.doctor_en}</h3>
                                <p class="text-teal-400 text-[10px] font-bold uppercase tracking-widest">${lang === 'ar' ? doc.specialty_ar : doc.specialty_en}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-3 mb-8">
                            <div class="bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-1">
                                 <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest">${lang === 'ar' ? 'ساعات العمل' : 'Working Hours'}</span>
                                 <span class="text-white font-mono font-bold text-sm">${doc.hours}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <a href="appointment.html?docId=${doc.id}" class="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all text-center shadow-lg shadow-teal-500/10 active:scale-95">
                             ${lang === 'ar' ? 'حجز موعد' : 'Book Appointment'}
                        </a>
                        ${(doc.location_url || window.clinicData.location_url) ? `
                        <a href="${doc.location_url || window.clinicData.location_url}" target="_blank" class="w-full bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-2xl font-bold transition-all text-center text-[9px] uppercase tracking-widest">
                             ${lang === 'ar' ? 'الموقع على الخريطة' : 'View on Map'}
                        </a>` : ''}
                    </div>
                </div>
            `).join('');
        }
    };
}

function renderCredits() {
    const main = document.getElementById('page-content');
    if (!main) return;
    const lang = window.i18n ? window.i18n.getLanguage() : 'ar';
    
    main.innerHTML = `
        <div class="text-center relative py-20">
            <canvas id="modern-canvas" class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-50"></canvas>
            <div class="relative z-10 max-w-2xl mx-auto px-4">
                <h1 class="text-6xl font-black text-white mb-8 tracking-tighter">CREDITS</h1>
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                    <h2 class="text-3xl font-bold text-teal-400 mb-6">${window.clinicData.doctor_name_ar}</h2>
                    <p class="text-slate-300 leading-relaxed text-lg mb-8 text-justify">
                        ${lang === 'ar' 
                            ? 'تم تصميم هذه الصفحة لتحقيق أعلى مستويات التوعية الطبية لمرضى الأسنان. نهدف إلى تقديم تعليمات دقيقة وواضحة تساعدكم في الحفاظ على صحة ابتسامتكم.' 
                            : 'Designed to provide professional dental education. Our goal is to offer clear, accurate instructions to ensure the longevity of your healthy smile.'}
                    </p>
                    <div class="flex flex-col items-center gap-4">
                         <div class="w-16 h-1 w-16 bg-teal-500 rounded-full"></div>
                         <p class="text-slate-500 italic">"Smile, it's free"</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    initModernAnimation();
}

function initModernAnimation() {
    const canvas = document.getElementById('modern-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 1;
            this.speedY = (Math.random() - 0.5) * 1;
            this.color = `hsla(${200 + Math.random() * 50}, 70%, 70%, ${0.2 + Math.random() * 0.3})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > w) this.x = 0; else if (this.x < 0) this.x = w;
            if (this.y > h) this.y = 0; else if (this.y < 0) this.y = h;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = Array.from({length: 100}, () => new Particle());
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
}
