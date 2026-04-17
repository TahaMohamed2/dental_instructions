#!/usr/bin/env python3
"""
Site Generator for Dental Instructions CMS
Generates HTML pages from templates and content database
"""

import os
import json
import shutil
from pathlib import Path
from datetime import datetime

class SiteGenerator:
    def __init__(self, base_dir="."):
        self.base_dir = Path(base_dir)
        self.content_dir = self.base_dir / "content" / "database"
        self.template_dir = self.base_dir / "templates"
        self.sites_dir = self.base_dir / "sites"
        self.output_dir = self.base_dir / "generated_sites"

    def load_content(self, instruction_type):
        """Load content for a specific instruction type"""
        content_file = self.content_dir / f"{instruction_type}.json"

        if not content_file.exists():
            print(f"Content file not found: {content_file}")
            return None

        try:
            with open(content_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading content {instruction_type}: {e}")
            return None

    def load_template(self):
        """Load the base template"""
        template_file = self.template_dir / "base_template_embedded_styles.html"

        if not template_file.exists():
            print(f"Template file not found: {template_file}")
            return None

        try:
            with open(template_file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error loading template: {e}")
            return None

    def load_site_config(self, site_name):
        """Load site configuration"""
        config_file = self.sites_dir / site_name / "config.json"

        if not config_file.exists():
            print(f"Config file not found: {config_file}")
            return None

        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config {site_name}: {e}")
            return None

    def generate_page(self, instruction_type, site_config, content_data):
        """Generate a single page"""
        template = self.load_template()
        if not template:
            return False

        # Get the standard version content
        standard_version = site_config.get('content', {}).get('standardVersion', 'dr_taha')
        content = content_data.get('versions', {}).get(standard_version, {})

        if not content:
            print(f"No content found for {instruction_type} in version {standard_version}")
            return False

        # Replace template placeholders
        page_html = template

        # Replace title
        title = content.get('title', f'Dental Instructions - {instruction_type}')
        page_html = page_html.replace('id="page-title">Dental Instructions', f'id="page-title">{title}')
        page_html = page_html.replace('id="instruction-title" class="text-4xl font-bold text-center mb-8 text-white">Dental Instructions</h1>', f'id="instruction-title" class="text-4xl font-bold text-center mb-8 text-white">{title}</h1>')

        # Generate content HTML
        content_html = self.generate_content_html(content.get('content', []), site_config)
        page_html = page_html.replace('id="content-area" class="space-y-4">Loading content...</div>', f'id="content-area" class="space-y-4">{content_html}</div>')

        # Set site-specific configurations
        site_name = site_config.get('site', {}).get('name', 'Dental Site')
        page_html = page_html.replace('Dental Instructions CMS', site_name)

        return page_html

    def generate_content_html(self, content_list, site_config):
        """Generate HTML for content items"""
        if not content_list:
            return '<p>No content available</p>'

        html_parts = []
        css_framework = site_config.get('styling', {}).get('cssFramework', 'basic')

        for item in content_list:
            if css_framework == 'tailwind':
                html_parts.append(f'<p class="mb-4 text-slate-200 leading-relaxed">{item}</p>')
            elif css_framework == 'bootstrap':
                html_parts.append(f'<p class="mb-3">{item}</p>')
            else:
                html_parts.append(f'<p style="margin-bottom: 15px;">{item}</p>')

        return '\n'.join(html_parts)

    def generate_site(self, site_name):
        """Generate all pages for a specific site"""
        print(f"Generating site: {site_name}")

        site_config = self.load_site_config(site_name)
        if not site_config:
            return False

        # Create output directory
        site_output_dir = self.output_dir / site_name
        site_output_dir.mkdir(parents=True, exist_ok=True)

        # Get all instruction types
        instruction_types = [
            'bleaching', 'brushing', 'denture_instructions', 'endo_instructions',
            'extraction_instruction', 'fixed', 'implant', 'ortho', 'pedo_education',
            'pedo', 'perio_surgery', 'restoration', 'scalling_instructions', 'tmj_instructions'
        ]

        generated_count = 0

        for instruction_type in instruction_types:
            content_data = self.load_content(instruction_type)
            if not content_data:
                continue

            page_html = self.generate_page(instruction_type, site_config, content_data)
            if page_html:
                output_file = site_output_dir / f"{instruction_type}.html"
                try:
                    with open(output_file, 'w', encoding='utf-8') as f:
                        f.write(page_html)
                    generated_count += 1
                    print(f"  Generated: {instruction_type}.html")
                except Exception as e:
                    print(f"  Error writing {instruction_type}.html: {e}")

        print(f"Site {site_name} generated with {generated_count} pages")
        return True

    def generate_all_sites(self):
        """Generate all sites"""
        print("Starting site generation...")

        # Get all site directories
        site_dirs = [d for d in self.sites_dir.iterdir() if d.is_dir()]

        for site_dir in site_dirs:
            site_name = site_dir.name
            if site_name != '__pycache__':  # Skip Python cache
                self.generate_site(site_name)

        print("All sites generated successfully!")

    def copy_assets(self, site_name):
        """Copy site-specific assets"""
        site_config = self.load_site_config(site_name)
        if not site_config:
            return

        site_output_dir = self.output_dir / site_name

        # Copy assets based on site configuration
        assets = site_config.get('assets', {})
        resources_path = assets.get('resourcesPath', 'resources/')

        # Create resources directory
        resources_output_dir = site_output_dir / 'resources'
        resources_output_dir.mkdir(exist_ok=True)

        # Copy resource files if they exist
        resources_source = self.base_dir / resources_path
        if resources_source.exists():
            for file_path in resources_source.iterdir():
                if file_path.is_file():
                    shutil.copy2(file_path, resources_output_dir / file_path.name)

    def create_index_file(self, site_name):
        """Create an index.html that redirects to main page"""
        site_config = self.load_site_config(site_name)
        if not site_config:
            return

        site_output_dir = self.output_dir / site_name

        # Create index.html that redirects to bleaching.html (main instruction)
        index_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=bleaching.html">
    <title>{site_config.get('site', {}).get('name', 'Dental Instructions')}</title>
</head>
<body>
    <p>Redirecting to main page...</p>
    <p><a href="bleaching.html">Click here if you are not redirected</a></p>
</body>
</html>"""

        index_file = site_output_dir / "index.html"
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(index_content)

def main():
    generator = SiteGenerator()
    generator.generate_all_sites()

    # Copy assets for each site
    for site_dir in generator.sites_dir.iterdir():
        if site_dir.is_dir() and site_dir.name != '__pycache__':
            generator.copy_assets(site_dir.name)
            generator.create_index_file(site_dir.name)

    print("Site generation completed!")
    print(f"Generated sites are available in: {generator.output_dir}")

if __name__ == "__main__":
    main()
