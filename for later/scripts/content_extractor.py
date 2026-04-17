#!/usr/bin/env python3
"""
Content Extraction Script for Dental Instructions CMS
Extracts content from existing HTML files into structured JSON format
"""

import os
import json
import re
from bs4 import BeautifulSoup
from pathlib import Path

class ContentExtractor:
    def __init__(self):
        self.instruction_types = [
            'bleaching', 'brushing', 'denture_instructions', 'endo_instructions',
            'extraction_instruction', 'fixed', 'implant', 'ortho', 'pedo_education',
            'pedo', 'perio_surgery', 'restoration', 'scalling_instructions', 'tmj_instructions'
        ]

    def extract_content_from_html(self, file_path):
        """Extract content from HTML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            soup = BeautifulSoup(content, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.extract()

            # Extract title
            title_elem = soup.find('h1')
            title = title_elem.get_text().strip() if title_elem else ""

            # Extract all paragraphs and list items
            content_parts = []

            # Get all text content except navigation elements
            for elem in soup.find_all(['p', 'li', 'h2', 'h3', 'h4', 'h5', 'h6']):
                text = elem.get_text().strip()
                if text and len(text) > 10:  # Filter out short navigation text
                    # Skip navigation-related text
                    if not any(skip in text.lower() for skip in [
                        'الرئيسية', 'home', 'credits', 'qr', 'button'
                    ]):
                        content_parts.append(text)

            return {
                'title': title,
                'content': content_parts,
                'source_file': str(file_path),
                'extraction_date': str(Path(file_path).stat().st_mtime)
            }

        except Exception as e:
            print(f"Error extracting content from {file_path}: {e}")
            return None

    def extract_from_directory(self, directory_path, instruction_type):
        """Extract content from all versions of a specific instruction type"""
        content_data = {
            'instruction_type': instruction_type,
            'versions': {}
        }

        # Look for the instruction file in different directories
        search_paths = [
            Path(directory_path) / f"{instruction_type}.html",
            Path(directory_path) / "DR.TAHA" / f"{instruction_type}.html",
            Path(directory_path) / "playground" / f"{instruction_type}.html"
        ]

        for path in search_paths:
            if path.exists():
                version_name = self._get_version_name(path)
                content = self.extract_content_from_html(path)
                if content:
                    content_data['versions'][version_name] = content

        return content_data

    def _get_version_name(self, file_path):
        """Get version name from file path"""
        path_parts = Path(file_path).parts
        if 'DR.TAHA' in path_parts:
            return 'dr_taha'
        elif 'playground' in path_parts:
            return 'playground'
        else:
            return 'root'

    def compare_versions(self, content_data):
        """Compare content between different versions"""
        if len(content_data['versions']) <= 1:
            return {'status': 'single_version', 'differences': []}

        versions = content_data['versions']
        version_names = list(versions.keys())

        differences = []
        base_content = versions[version_names[0]]['content']

        for version_name in version_names[1:]:
            current_content = versions[version_name]['content']

            # Simple comparison - in production, use more sophisticated diff
            if base_content != current_content:
                differences.append({
                    'version': version_name,
                    'difference_type': 'content_mismatch',
                    'details': f"Content differs from {version_names[0]} version"
                })

        return {
            'status': 'multiple_versions',
            'differences': differences,
            'consistent': len(differences) == 0
        }

    def save_content_database(self, content_data, output_dir):
        """Save extracted content to JSON file"""
        instruction_type = content_data['instruction_type']
        output_file = Path(output_dir) / f"{instruction_type}.json"

        # Add comparison data
        content_data['comparison'] = self.compare_versions(content_data)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(content_data, f, ensure_ascii=False, indent=2)

        return output_file

def main():
    extractor = ContentExtractor()
    base_dir = Path(".")

    # Create output directory if it doesn't exist
    output_dir = Path("content/database")
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Starting content extraction...")

    for instruction_type in extractor.instruction_types:
        print(f"Extracting {instruction_type}...")
        content_data = extractor.extract_from_directory(base_dir, instruction_type)

        if content_data['versions']:
            output_file = extractor.save_content_database(content_data, output_dir)
            print(f"  Saved to {output_file}")
        else:
            print(f"  No files found for {instruction_type}")

    print("Content extraction completed!")

if __name__ == "__main__":
    main()
