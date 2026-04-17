import os
import json
import re
from html.parser import HTMLParser

class InstructionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_content = False
        self.current_tag = None
        self.sections = []
        self.current_section = None
        self.current_list = []
        self.title = ""
        self.in_title = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "div" and attrs_dict.get("class") == "max-w-4xl mx-auto":
            self.in_content = True
        
        if not self.in_content and tag == "title":
            self.in_title = True
            
        if not self.in_content:
            return
            
        if tag in ["h1", "h2", "h3"]:
            if self.current_section and (self.current_section.get("items_ar") or self.current_section.get("paragraphs_ar")):
                self.sections.append(self.current_section)
                
            self.current_section = {
                "type": "text", 
                "heading_ar": "",
                "heading_en": "",
                "items_ar": [],
                "items_en": [],
                "paragraphs_ar": [],
                "paragraphs_en": []
            }
            self.current_tag = tag
        elif tag == "ul":
            if not self.current_section:
                self.current_section = {
                    "type": "text",
                    "heading_ar": "",
                    "heading_en": "",
                    "items_ar": [],
                    "items_en": [],
                    "paragraphs_ar": [],
                    "paragraphs_en": []
                }
            self.current_section["type"] = "list"
        elif tag == "li":
            self.current_tag = "li"
        elif tag == "p":
            if not self.current_section:
                self.current_section = {
                    "type": "text", 
                    "heading_ar": "",
                    "heading_en": "",
                    "items_ar": [],
                    "items_en": [],
                    "paragraphs_ar": [],
                    "paragraphs_en": []
                }
            self.current_tag = "p"
            
    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
            
        if not self.in_content:
            return
            
        if tag == "div":
            # Very simplistic, assumes one div block. Might not be correct if nested divs.
            pass
        elif tag == "ul":
            # we finish a list
            pass
        
        self.current_tag = None
        
    def handle_data(self, data):
        data = data.strip()
        if not data:
            return
            
        if self.in_title:
            self.title = data
            
        if not self.in_content:
            return
            
        if self.current_tag == "h1":
            # skip h1, usually the main title, which we have from <title> or h1
            if not self.title:
                self.title = data
        elif self.current_tag in ["h2", "h3"]:
            self.current_section["heading_ar"] += data
        elif self.current_tag == "li":
            self.current_section["items_ar"].append(data)
            self.current_section["items_en"].append("")
        elif self.current_tag == "p":
            self.current_section["paragraphs_ar"].append(data)
            self.current_section["paragraphs_en"].append("")

files = [
    "extraction_instruction.html", "denture_instructions.html", "endo_instructions.html",
    "bleaching.html", "brushing.html", "scalling_instructions.html", "ortho.html",
    "restoration.html", "fixed.html", "implant.html", "tmj_instructions.html",
    "pedo.html", "perio_surgery.html"
]

out = {}

base_dir = "d:/Toto/Data Analysis programs/dental_instructions_site/playground"

for f in files:
    key = f.replace("_instructions", "").replace("_instruction", "").replace(".html", "")
    with open(os.path.join(base_dir, f), 'r', encoding='utf-8') as file:
        content = file.read()
        
    parser = InstructionParser()
    parser.feed(content)
    if parser.current_section and (parser.current_section.get("items_ar") or parser.current_section.get("paragraphs_ar")):
        parser.sections.append(parser.current_section)
        
    # Clean up sections logically
    cleaned_sections = []
    for s in parser.sections:
        if s["items_ar"]:
            s["type"] = "list"
        else:
            s["type"] = "text"
            
        if not s["heading_ar"]:
            s["heading_ar"] = None
            s["heading_en"] = None
            
        if not s["items_ar"]:
            del s["items_ar"]
            del s["items_en"]
        if not s.get("paragraphs_ar"):
            if "paragraphs_ar" in s:
                del s["paragraphs_ar"]
                del s["paragraphs_en"]
                
        cleaned_sections.append(s)
        
    out[key] = {
        "title_ar": parser.title,
        "title_en": "",
        "sections": cleaned_sections
    }

# Handle pedo_education.html specially
with open(os.path.join(base_dir, "pedo_education.html"), 'r', encoding='utf-8') as file:
    content = file.read()

# using regex to extract `const texts = [...]` and `const topicTitles = [...]`
texts_match = re.search(r"const texts = \[([\s\S]*?)\];", content)
titles_match = re.search(r"const topicTitles = \[([\s\S]*?)\];", content)

out["pedo_education"] = {
    "title_ar": "توعية للأطفال",
    "title_en": "Children's Dental Awareness",
    "topics": []
}

if texts_match and titles_match:
    import ast
    # Make them safe strings to eval by doing literal_eval
    # actually wait, it's easier to just split by comma but there are commas inside.
    # regex for strings `...` or "..."
    # A bit hard to regex. Let's do a simple split or ast if we replace backticks.
    
    titles_str = "[" + titles_match.group(1).replace('"', "'") + "]"
    titles = ast.literal_eval(titles_str)
    
    # texts is array of JS template literals `...`. We can split by `,` if not in quotes. 
    # Or just use regex `\n[\s]*\`(.*?)\`[\s]*(?:,|\])`
    texts = re.findall(r"`([\s\S]*?)`\s*(?:,|$)", texts_match.group(1))
    
    for i, (t, c) in enumerate(zip(titles, texts)):
        # clean the content
        out["pedo_education"]["topics"].append({
            "id": i,
            "button_label_ar": t.strip(),
            "button_label_en": "",
            "title_ar": t.strip(),
            "title_en": "",
            "content_ar": c.strip(),
            "content_en": ""
        })

os.makedirs(os.path.join(base_dir, "data"), exist_ok=True)
with open(os.path.join(base_dir, "data", "instructions.json"), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("Created instructions.json")

# Now services.json
with open(os.path.join(base_dir, "clinic_services.html"), 'r', encoding='utf-8') as file:
    services_content = file.read()

services_parser = HTMLParser()
# just simple regex
services_out = {"services": []}
blocks = re.split(r'<!--\s*(.+?)\s*-->', services_content)

current_service = None
for i in range(1, len(blocks), 2):
    comment = blocks[i].strip()
    html_block = blocks[i+1]
    
    if comment == "Header Section":
        continue
        
    title_ar = comment.split("-")[0].strip() if "-" in comment else comment
    title_en = comment.split("-")[1].strip() if "-" in comment else ""
    
    images = re.findall(r'data-src="([^"]+)"', html_block) or re.findall(r'src="([^"]+)"', html_block)
    
    id_str = title_en.lower().replace(" ", "_").replace("'", "") if title_en else comment.lower().replace(" ", "_")
    if not id_str:
        id_str = f"service_{len(services_out['services'])}"
        
    services_out["services"].append({
        "id": id_str,
        "title_ar": title_ar,
        "title_en": title_en,
        "images": images
    })

with open(os.path.join(base_dir, "data", "services.json"), 'w', encoding='utf-8') as f:
    json.dump(services_out, f, ensure_ascii=False, indent=2)
    
print("Created services.json")
