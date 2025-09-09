# TODO List for Bootstrap Migration and Responsiveness

- [x] Add Bootstrap CSS import to styles.css and index_styles.css
- [x] Ensure RTL support in CSS (direction: rtl; text-align: right;)
- [x] Preserve custom button colors and sizes in CSS with Bootstrap utilities
- [x] Update fixed-position buttons (home-button, qr-btn, credits-btn) to use Bootstrap classes with custom positioning overrides
- [x] Update iframe containers and embedded images to use Bootstrap responsive classes
- [x] Replace Tailwind CDN with Bootstrap CDN in all HTML files (except playground/)
- [x] Replace Tailwind grid classes with Bootstrap grid system in all HTML files
- [x] Replace Tailwind button classes with Bootstrap btn classes, preserving custom colors via inline styles or CSS classes
- [x] Add dir="rtl" to html tags if missing, ensure Bootstrap RTL support
- [x] Adjust padding/margins for mobile responsiveness using Bootstrap utilities
- [x] Test responsiveness on smartphone, tablet, desktop for all pages
- [x] Verify button colors, sizes, hover states, and functionality remain intact
- [x] Backup original HTML and CSS files before changes
- [x] Exclude playground/ folder from changes

# Next Steps

- Update styles.css and index_styles.css
- Update index.html and other HTML files (bleaching.html, brushing.html, credits.html, denture_instructions.html, endo_instructions.html, extraction_instruction.html, fixed.html, implant.html, ortho.html, pedo_education.html, pedo.html, perio_surgery.html, restoration.html, scalling_instructions.html, template.html, tmj_instructions.html)
- Test and verify changes
