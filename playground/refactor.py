import os

base_dir = "d:/Toto/Data Analysis programs/dental_instructions_site/playground"
files = [
    ("extraction_instruction.html", "extraction"), 
    ("denture_instructions.html", "denture"), 
    ("endo_instructions.html", "endo"),
    ("bleaching.html", "bleaching"), 
    ("brushing.html", "brushing"), 
    ("scalling_instructions.html", "scalling"), 
    ("ortho.html", "ortho"),
    ("restoration.html", "restoration"), 
    ("fixed.html", "fixed"), 
    ("implant.html", "implant"), 
    ("tmj_instructions.html", "tmj"),
    ("pedo.html", "pedo"), 
    ("perio_surgery.html", "perio_surgery")
]

template = """<!DOCTYPE html>
<html lang="ar" dir="rtl" data-lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dental Instructions</title>
  <link rel="icon" href="resources/instructions_logo.ico" type="image/x-icon">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="index_styles.css" />
  <script src="js/i18n.js" defer></script>
  <script src="js/site-loader.js" defer></script>
  <script src="QR_image_viewer.js" defer></script>
</head>
<body data-page="{page_id}" class="bg-slate-800 text-slate-100 font-sans p-5 flex flex-col min-h-screen relative">
  <header id="site-header"></header>
  <main id="page-content" class="max-w-4xl mx-auto w-full flex-grow"></main>
  <footer id="site-footer"></footer>
</body>
</html>"""

for f, page_id in files:
    with open(os.path.join(base_dir, f), 'w', encoding='utf-8') as out:
        out.write(template.replace("{page_id}", page_id))

print("Refactored 13 instruction pages.")
