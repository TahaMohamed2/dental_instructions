# AI Development Log & Behavior Learning

## Session: 2026-04-18 (Premium Background Selection Feature)

### User Request 1
> "in the playground i want to add a few styles CSS with some backgrounds for the client to select from can you help me with that the background samples should be provided though this api https://metmuseum.github.io/ with user ability to add their own"

### Actions Taken
1. **Research**: Investigated the Metropolitan Museum of Art Collection API. Identified search patterns for "patterns", "textiles", and "abstract" to provide premium dental clinic backgrounds.
2. **Planning**: Created a detailed `implementation_plan.md` (Artifact) covering UI changes in Step 3 of onboarding, API integration, and global style application.
3. **UI Implementation**:
    - Modified `onboarding.html` to include a background selection gallery and custom URL/upload fields.
    - Updated `index_styles.css` with a Slate-900 overlay (70% opacity) to maintain text contrast over complex images.
4. **Logic Implementation**:
    - Enhanced `onboarding-logic.js` with `fetchMetBackgrounds()` to pull random masterpieces from the Met API.
    - Added support for local file uploads (converted to Data URLs) and external image URLs.
    - Updated `site-loader.js` to apply the background globally with `background-size: cover`.
5. **Verification**: Used a browser subagent to verify the gallery loads, the "Refresh Art" button works, and the theme preview updates in real-time.

---

### User Request 2
> "the clinic may have many specialists so in the clinic schedule the timetable for each day should be divided for each specialist based on their scedule and their information be provided such as spechiality and office hours and if the client pressed on a doctors name then they are directed to book an appointment it that doctors available hours"

### Actions Taken
1. **Schema Migration**: Refactored `clinic.json` from a single-doctor object per day to an array of specialist objects, each with unique IDs, specialties, and calendar URLs.
2. **Onboarding Expansion**: Increased the builder to a **6-Step Workflow**, inserting a "Specialist Rotation" step with a dynamic multi-doctor management UI.
3. **Card-Based UI**: Rewrote the schedule rendering in `site-loader.js` to generate high-fidelity **Doctor Specialty Cards** with glassmorphism effects and individual action buttons.
4. **Contextual Redirection**: Implemented a "Smart Shell" in `appointment.html` that reads `docId` from the URL to automatically personalize the greeting and load the correct specialist's Google Calendar.
5. **Asset Sanitization**: Ensured the system uses clean templates for new clinics, removing hardcoded samples and allowing full clinician-driven data entry.

---

### User Request 3 (Current)
> "append all history in this chat to AI_log.MD containing all my inputs .actions done by you. and my instructions for learning my behavior later"

### Learning & Behavior Instructions
To help me (the AI) align better with your preferences in future sessions, I have noted the following patterns:

1. **Aesthetic Priority**: You value "wow" factor and premium designs. When asked for styles, I should prioritize high-fidelity, modern aesthetics (like glassmorphism, high-quality art integration, and smooth transitions).
2. **User Experience Continuity**: You prefer internal redirection (e.g., `appointment.html?docId=...`) over external links to keep the patient within the clinic's digital ecosystem.
3. **Dynamic Content Shells**: You value "Smart Shells" that adapt to URL parameters to provide personalized experiences (greetings, specific doctor info).
4. **Clean Slate Philosophy**: New clinic products should always start from "Clean Templates" (`portfolio_template.json`, etc.) to ensure the end-user isn't confused by sample data from other clinicians.
5. **UI-Driven Data Management**: For complex data (like multi-doctor schedules), you prefer interactive, tabbed management interfaces within the onboarding wizard rather than manual JSON editing.
6. **Social & Location Context**: You consider Google Maps URLs and comprehensive social media integration (WhatsApp, FB, IG, LinkedIn) as core "Critical Info" for a professional presence.

---
*Log generated on 2026-04-28*
