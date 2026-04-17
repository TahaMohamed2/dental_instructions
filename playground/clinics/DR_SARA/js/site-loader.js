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
        const [clinicRes, instructionsRes] = await Promise.all([
            fetch('data/clinic.json'),
            fetch('data/instructions.json')
        ]);
        
        if (!clinicRes.ok || !instructionsRes.ok) {
            throw new Error(`Failed to load JSON files. Status: ${clinicRes.status}, ${instructionsRes.status}`);
        }

        const clinicData = await clinicRes.json();
        const instructionsData = await instructionsRes.json();
        
        console.log("Data loaded successfully:", { clinicData, instructionsData });

        window.clinicData = clinicData;
        window.instructionsData = instructionsData;
        
        applyClinicBranding(clinicData);
        renderSharedComponents(clinicData);
        
        const pageId = document.body.dataset.page;
        if (pageId && instructionsData[pageId]) {
            renderInstructionPage(instructionsData[pageId]);
        }
        
        // Listen for language change to re-render
        window.addEventListener('languageChanged', () => {
             const lang = window.i18n.getLanguage();
             document.title = lang === 'ar' ? clinicData.clinic_name_ar : clinicData.clinic_name_en;
             if (pageId && instructionsData[pageId]) {
                 renderInstructionPage(instructionsData[pageId]);
             }
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
            <div class="flex items-center space-x-4 space-x-reverse">
                <img src="${clinic.logo}" alt="Logo" class="h-12 w-12 rounded-full cursor-pointer" onclick="window.location.href='index.html'" onerror="this.style.display='none'">
                <h1 class="text-2xl font-bold text-white header-title">
                   <span class="ar-only">${clinic.clinic_name_ar}</span>
                   <span class="en-only" style="display:none;">${clinic.clinic_name_en}</span>
                </h1>
            </div>
            <div class="flex space-x-2 space-x-reverse">
                <button id="lang-toggle-btn" class="bg-gray-600 text-slate-100 text-xs border-none rounded-lg px-3 py-2 cursor-pointer transition-all duration-300 shadow-lg hover:bg-gray-500" onclick="window.i18n.toggleLanguage()">English</button>
                <button id="home-btn" class="bg-gray-600 text-slate-100 text-xs border-none rounded-lg px-3 py-2 cursor-pointer transition-all duration-300 shadow-lg hover:bg-gray-500" onclick="window.location.href='index.html'">الرئيسية</button>
            </div>
        `;
    }

    const footer = document.getElementById('site-footer');
    if (footer) {
        footer.innerHTML = `
            <button onclick="viewQRImage()" class="fixed bottom-5 left-5 bg-transparent border-none rounded-lg p-1 text-lg cursor-pointer transition-all duration-300 w-12 text-slate-100 z-50">
                <img src="resources/QR.jpeg" alt="QR" class="max-w-full rounded-lg shadow-lg" />
            </button>
            <button onclick="location.href='credits.html'" class="fixed bottom-5 right-5 bg-gray-600 text-slate-100 text-xs border-none rounded-lg px-2 py-1 cursor-pointer transition-all duration-300 shadow-lg hover:bg-gray-500 z-50">credits</button>
        `;
    }
    
    // update display initially
    if(window.i18n) window.i18n.updateStaticUI();
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
                html += `<h2 class="text-2xl font-semibold mb-4 mt-6 text-white">${h}</h2>`;
            }
            
            if (section.type === 'list' && section.items_ar) {
                const items = lang === 'ar' ? section.items_ar : (section.items_en && section.items_en[0] ? section.items_en : section.items_ar);
                html += `<ul class="list-disc list-inside mb-6 space-y-2 text-slate-200 leading-relaxed">`;
                items.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul>`;
            }
            
            const pkey = lang === 'ar' ? 'paragraphs_ar' : 'paragraphs_en';
            const paragraphs = section[pkey] && section[pkey][0] ? section[pkey] : section.paragraphs_ar;
            if (paragraphs) {
                paragraphs.forEach(p => {
                    html += `<p class="mb-4 text-slate-200 leading-relaxed">${p}</p>`;
                });
            }
        });
    }
    
    main.innerHTML = html;
}
