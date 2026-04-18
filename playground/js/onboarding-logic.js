let currentStep = 1;
const totalSteps = 6;
let rotationData = { sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [] };
let activeRotationDay = 'sunday';
let instructionsData = null;
let servicesTemplate = null;
let portfolioData = { cases: [] };

document.addEventListener('DOMContentLoaded', async () => {
    // Initial setup
    updateUI();
    
    // Fetch data templates
    try {
        const [instRes, servRes, clinRes] = await Promise.all([
            fetch('data/instructions.json'),
            fetch('data/services_template.json'),
            fetch('data/clinic.json')
        ]);
        instructionsData = await instRes.json();
        servicesTemplate = await servRes.json();
        const baseClinic = await clinRes.json();
        
        // Populate initial rotation from existing clinic if possible
        if (baseClinic.schedule) rotationData = { ...rotationData, ...baseClinic.schedule };
        
        populateTopics();
        renderRotationList();
    } catch (e) {
        console.error("Failed to load templates for onboarding", e);
    }

    // Toggle Portolio Builder visibility
    document.querySelector('input[name="feature_portfolio"]').addEventListener('change', (e) => {
         const builder = document.getElementById('portfolio-builder');
         if (e.target.checked) builder.classList.remove('hidden');
         else builder.classList.add('hidden');
    });

    // Event Listeners
    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
        }
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    // Theme color & background preview
    const primaryInput = document.querySelector('input[name="primary_color"]');
    const accentInput = document.querySelector('input[name="accent_color"]');
    const bgInput = document.querySelector('input[name="background_image"]');
    const previewChip = document.getElementById('preview-chip');

    window.updateChip = () => {
        if (!previewChip) return;
        previewChip.style.backgroundColor = primaryInput.value;
        previewChip.style.borderColor = accentInput.value;
        previewChip.style.boxShadow = `0 10px 30px ${accentInput.value}44`;
        
        if (bgInput && bgInput.value) {
            previewChip.style.backgroundImage = `url(${bgInput.value})`;
        } else {
            previewChip.style.backgroundImage = 'none';
        }
    };

    primaryInput.addEventListener('input', updateChip);
    accentInput.addEventListener('input', updateChip);
    if (bgInput) bgInput.addEventListener('input', updateChip);
    updateChip();

    // Initial background load
    loadMetBackgrounds();

    // Local file upload for background
    const bgFileBtn = document.getElementById('bg-file-upload');
    if (bgFileBtn) {
        bgFileBtn.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const dataUrl = await fileToDataURL(e.target.files[0]);
                if (bgInput) {
                    bgInput.value = dataUrl;
                    updateChip();
                }
            }
        });
    }
});

window.loadMetBackgrounds = async () => {
    const gallery = document.getElementById('met-bg-gallery');
    if (!gallery) return;

    gallery.innerHTML = '<div class="col-span-full py-4 text-center text-slate-600 italic text-xs animate-pulse">Fetching masterpieces...</div>';

    const queries = ['textile pattern', 'abstract art', 'geometric', 'wallpaper', 'texture'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    try {
        const searchRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=${randomQuery}`);
        const searchData = await searchRes.json();
        
        if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
            gallery.innerHTML = '<div class="col-span-full text-slate-500 text-xs text-center">No art found. Try again.</div>';
            return;
        }

        // Pick random IDs from the first 100 results
        const ids = searchData.objectIDs.slice(0, 50).sort(() => 0.5 - Math.random()).slice(0, 12);
        
        gallery.innerHTML = ''; // Clear loading
        
        for (const id of ids) {
            try {
                const objRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                const objData = await objRes.json();
                
                if (objData.primaryImageSmall) {
                    const img = document.createElement('div');
                    img.className = "w-full aspect-square bg-slate-900 border border-white/5 rounded-lg cursor-pointer hover:border-teal-500/50 transition-all bg-cover bg-center overflow-hidden";
                    img.style.backgroundImage = `url(${objData.primaryImageSmall})`;
                    img.title = objData.title;
                    img.onclick = () => {
                        const bgInp = document.querySelector('input[name="background_image"]');
                        if (bgInp) {
                            bgInp.value = objData.primaryImageSmall;
                            document.querySelectorAll('#met-bg-gallery > div').forEach(el => el.classList.remove('border-teal-500', 'ring-2', 'ring-teal-500/20'));
                            img.classList.add('border-teal-500', 'ring-2', 'ring-teal-500/20');
                            updateChip();
                        }
                    };
                    gallery.appendChild(img);
                }
            } catch (err) { console.warn("Failed to fetch Met object", id); }
        }
    } catch (e) {
        gallery.innerHTML = '<div class="col-span-full text-red-500/50 text-xs text-center">API Error. Check your connection.</div>';
    }
};

window.toggleInstructions = () => {
    const container = document.getElementById('topics-container');
    const chevron = document.getElementById('instr-chevron');
    const isHidden = container.classList.contains('hidden');
    
    if (isHidden) {
        container.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
    } else {
        container.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
    }
};

window.showSpecialistDay = (day) => {
    saveCurrentDayRotation();
    activeRotationDay = day;
    document.querySelectorAll('.day-tab').forEach(btn => {
        if (btn.dataset.day === day) btn.classList.add('active', 'border-teal-500', 'text-teal-400');
        else btn.classList.remove('active', 'border-teal-500', 'text-teal-400');
    });
    document.getElementById('current-day-label').textContent = `${day.charAt(0).toUpperCase() + day.slice(1)} Specialists`;
    renderRotationList();
};

window.addDoctorToDay = () => {
    rotationData[activeRotationDay].push({
        id: `doc-${Date.now()}`,
        doctor_ar: "", doctor_en: "",
        specialty_ar: "", specialty_en: "",
        hours: "", calendar_url: ""
    });
    renderRotationList();
};

window.removeDoctor = (index) => {
    rotationData[activeRotationDay].splice(index, 1);
    renderRotationList();
};

function renderRotationList() {
    const list = document.getElementById('doctors-list');
    if (!list) return;
    const dayData = rotationData[activeRotationDay] || [];
    if (dayData.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-600 text-xs italic">No specialists added for this day.</div>`;
        return;
    }
    list.innerHTML = dayData.map((doc, i) => `
        <div class="bg-slate-800/80 p-5 rounded-2xl border border-white/5 relative group rotation-item" data-index="${i}">
            <button type="button" onclick="removeDoctor(${i})" class="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value="${doc.doctor_ar}" placeholder="Doctor Name (AR)" class="doc-name-ar w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                <input type="text" value="${doc.doctor_en}" placeholder="Doctor Name (EN)" class="doc-name-en w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                <input type="text" value="${doc.specialty_ar}" placeholder="Specialty (AR)" class="spec-ar w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                <input type="text" value="${doc.specialty_en}" placeholder="Specialty (EN)" class="spec-en w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                <input type="text" value="${doc.hours}" placeholder="Hours (e.g., 5 PM - 10 PM)" class="hours w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                <input type="text" value="${doc.calendar_url}" placeholder="Google Calendar Embed URL" class="cal-url w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
            </div>
        </div>
    `).join('');
}

function saveCurrentDayRotation() {
    const items = document.querySelectorAll('.rotation-item');
    if (!items.length && rotationData[activeRotationDay].length) {
        // Keep existing if we just didn't render it yet
        return;
    }
    const dayData = [];
    items.forEach(item => {
        dayData.push({
            id: `doc-${Math.random().toString(36).substr(2, 9)}`,
            doctor_ar: item.querySelector('.doc-name-ar').value,
            doctor_en: item.querySelector('.doc-name-en').value,
            specialty_ar: item.querySelector('.spec-ar').value,
            specialty_en: item.querySelector('.spec-en').value,
            hours: item.querySelector('.hours').value,
            calendar_url: item.querySelector('.cal-url').value
        });
    });
    rotationData[activeRotationDay] = dayData;
}

let caseIdCounter = 0;
window.addPortfolioCase = () => {
    const list = document.getElementById('cases-list');
    const id = `case-${caseIdCounter++}`;
    
    const caseHtml = `
        <div class="bg-slate-900/80 p-6 rounded-2xl border border-white/5 space-y-4 relative group" id="${id}">
            <button type="button" onclick="document.getElementById('${id}').remove()" class="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase font-bold text-slate-500">Case Title (Arabic)</label>
                    <input type="text" placeholder="مثال: ابتسامة هوليوود" class="case-title-ar w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] uppercase font-bold text-slate-500">Case Title (English)</label>
                    <input type="text" placeholder="Example: Smile Makeover" class="case-title-en w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                </div>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] uppercase font-bold text-slate-500">Clinical Description</label>
                <textarea placeholder="Briefly describe the clinical work..." class="case-desc w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-20"></textarea>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] uppercase font-bold text-slate-500">Upload Clinical Photos (Multiple)</label>
                <input type="file" multiple accept="image/*" onchange="handleCaseImages(this, '${id}')" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20 cursor-pointer">
                <div class="case-previews flex gap-2 flex-wrap mt-2"></div>
            </div>
        </div>
    `;
    list.insertAdjacentHTML('beforeend', caseHtml);
};

window.handleCaseImages = async (input, caseElementId) => {
    const files = Array.from(input.files);
    const container = document.getElementById(caseElementId).querySelector('.case-previews');
    container.innerHTML = ''; // Reset
    
    const dataUrls = [];
    for (const file of files) {
        const dataUrl = await fileToDataURL(file);
        dataUrls.push(dataUrl);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = "w-16 h-16 object-cover rounded-lg border border-white/10";
        container.appendChild(img);
    }
    document.getElementById(caseElementId).dataset.images = JSON.stringify(dataUrls);
};

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function populateTopics() {
    const container = document.getElementById('topics-selection');
    if (!instructionsData || !container) return;

    let html = '';
    Object.keys(instructionsData).forEach(key => {
        const topic = instructionsData[key];
        html += `
            <label class="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-teal-500/30 transition-all select-none">
                <input type="checkbox" name="topic_${key}" checked class="w-5 h-5 accent-teal-500">
                <div>
                    <p class="font-bold text-white text-sm">${topic.title_ar}</p>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest">${topic.title_en}</p>
                </div>
            </label>
        `;
    });
    container.innerHTML = html;
}

function updateUI() {
    // Show/Hide steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${currentStep}`).classList.add('active');

    // Update dots
    document.querySelectorAll('.progress-dot').forEach((el, i) => {
        if (i < currentStep) el.classList.add('active');
        else el.classList.remove('active');
    });

    // Update buttons
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    
    if (currentStep === 1) prevBtn.classList.add('invisible');
    else prevBtn.classList.remove('invisible');

    if (currentStep === totalSteps) {
        nextBtn.textContent = "Finish & Preview";
        nextBtn.classList.add('invisible'); // Let the cards in Step 4 do the work
    } else {
        nextBtn.textContent = "Next Step";
        nextBtn.classList.remove('invisible');
    }

    document.getElementById('step-indicator').textContent = `Step ${currentStep} of ${totalSteps}`;
}

function getFormData() {
    const form = document.getElementById('onboarding-form');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    
    // Construct valid clinic.json schema
    const clinic = {
        clinic_name_ar: data.clinic_name_ar || "عيادة جديدة",
        clinic_name_en: data.clinic_name_en || "New Clinic",
        doctor_name_ar: data.doctor_name_ar || "د. طبيب",
        doctor_name_en: data.doctor_name_en || "Dr. Dentist",
        logo: data.logo || "resources/instructions_logo.ico",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        location_url: data.location_url || "",
        socials: {
            facebook: data.social_fb || "",
            instagram: data.social_ig || "",
            linkedin: data.social_ln || ""
        },
        enabled_features: {
            schedule: data.feature_schedule === 'on',
            services: data.feature_services === 'on',
            portfolio: data.feature_portfolio === 'on'
        },
        theme: {
            primary_color: data.primary_color,
            accent_color: data.accent_color,
            background_image: data.background_image || "",
            font_ar: "Cairo",
            font_en: "Inter"
        },
        google_calendar_embed_url: "",
        schedule: rotationData
    };

    // Filter topics
    const selectedTopics = {};
    Object.keys(instructionsData).forEach(key => {
        if (data[`topic_${key}`]) {
            selectedTopics[key] = instructionsData[key];
        }
    });

    // Assemble Portfolio
    const cases = [];
    const caseElements = document.querySelectorAll('#cases-list > div');
    caseElements.forEach(el => {
        cases.push({
            title_ar: el.querySelector('.case-title-ar').value || "حالة جديدة",
            title_en: el.querySelector('.case-title-en').value || "New Case",
            description: el.querySelector('.case-desc').value || "",
            images: el.dataset.images ? JSON.parse(el.dataset.images) : []
        });
    });
    const portfolio = { cases };

    return { clinic, selectedTopics, portfolio };
}

window.launchDemo = () => {
    saveCurrentDayRotation();
    const { clinic, selectedTopics, portfolio } = getFormData();
    
    // Store in Session Storage for site-loader to pick up
    sessionStorage.setItem('preview_clinic', JSON.stringify(clinic));
    sessionStorage.setItem('preview_instructions', JSON.stringify(selectedTopics));
    sessionStorage.setItem('preview_portfolio', JSON.stringify(portfolio));
    sessionStorage.setItem('preview_services', JSON.stringify(servicesTemplate)); // Starting with clean services for now
    sessionStorage.setItem('preview_mode', 'true');
    
    // Alert user
    alert("Preview Generated! Your clinical work has been processed. You will now be redirected to the home page in Demo mode.");
    
    window.location.href = 'index.html';
};

window.downloadConfig = () => {
    saveCurrentDayRotation();
    const { clinic, portfolio } = getFormData();
    
    // Complex download (can zip or just provide concatenated strings)
    // For now, let's just provide clinic.json including the theme
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({clinic, portfolio}, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "clinic_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
