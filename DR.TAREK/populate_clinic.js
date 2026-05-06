fetch('clinic-info.json')
  .then(response => response.json())
  .then(data => {
    const clinicNameEl = document.getElementById('clinic-name');
    if (clinicNameEl) clinicNameEl.textContent = data.name;

    const clinicNameFooterEl = document.getElementById('clinic-name-footer');
    if (clinicNameFooterEl) clinicNameFooterEl.textContent = data.name;

    const locationLinkEl = document.getElementById('location-link');
    if (locationLinkEl) locationLinkEl.href = data.location;

    const phoneLinkEl = document.getElementById('phone-link');
    if (phoneLinkEl) {
      phoneLinkEl.href = 'tel:' + data.phone;
      phoneLinkEl.textContent = data.phone;
    }

    const whatsappLinkEl = document.getElementById('whatsapp-link');
    if (whatsappLinkEl) whatsappLinkEl.href = data.whatsapp;

    const hoursEl = document.getElementById('hours');
    if (hoursEl) hoursEl.textContent = data.hours;
  })
  .catch(error => console.error('Error loading clinic info:', error));