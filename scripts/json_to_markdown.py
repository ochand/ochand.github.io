#!/usr/bin/env python3
"""
Dynamic JSON to Markdown Converter

This script converts JSON files to Markdown format with intelligent formatting
that adapts to the structure of the JSON. It handles nested objects, arrays,
and various data types while creating readable Markdown output.

Usage:
    python json_to_markdown.py input.json [output.md]
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Union


class JSONToMarkdownConverter:
    """Converts JSON data to well-formatted Markdown."""
    
    def __init__(self, indent_size: int = 2):
        """
        Initialize the converter.
        
        Args:
            indent_size: Number of spaces for indentation in nested lists
        """
        self.indent_size = indent_size
        self.current_depth = 0
        
    def convert(self, data: Any, title: str = None) -> str:
        """
        Convert JSON data to Markdown format.
        
        Args:
            data: JSON data (dict, list, or primitive)
            title: Optional title for the document
            
        Returns:
            Formatted Markdown string
        """
        lines = []
        
        if title:
            lines.append(f"# {title}\n")
        
        lines.extend(self._convert_value(data, level=1))
        
        return "\n".join(lines)
    
    def _convert_value(self, value: Any, level: int = 1, key: str = None) -> List[str]:
        """
        Recursively convert a value to Markdown lines.
        
        Args:
            value: The value to convert
            level: Current heading level (1-6)
            key: The key name (for objects)
            
        Returns:
            List of Markdown lines
        """
        if isinstance(value, dict):
            return self._convert_object(value, level, key)
        elif isinstance(value, list):
            return self._convert_array(value, level, key)
        else:
            return self._convert_primitive(value, key)
    
    def _convert_object(self, obj: Dict, level: int, key: str = None) -> List[str]:
        """Convert a JSON object to Markdown."""
        lines = []
        
        # Add heading for this object if it has a key
        if key:
            heading_level = min(level, 6)  # Markdown supports h1-h6
            heading = self._format_key(key)
            lines.append(f"{'#' * heading_level} {heading}\n")
        
        # Process each key-value pair
        for obj_key, obj_value in obj.items():
            # Check if this is a title/label field that should be used as heading
            if obj_key in ['title', 'name', 'label'] and isinstance(obj_value, str):
                next_level = min(level + 1, 6)
                lines.append(f"{'#' * next_level} {obj_value}\n")
            # Check for text/description fields
            elif obj_key in ['text', 'description', 'tagline', 'subtitle', 'intro'] and isinstance(obj_value, str):
                lines.append(f"{obj_value}\n")
            # Regular key-value pairs
            else:
                lines.extend(self._convert_value(obj_value, level + 1, obj_key))
        
        return lines
    
    def _convert_array(self, arr: List, level: int, key: str = None) -> List[str]:
        """Convert a JSON array to Markdown."""
        lines = []
        
        # Add heading for the array if it has a key
        if key:
            heading_level = min(level, 6)
            heading = self._format_key(key)
            lines.append(f"{'#' * heading_level} {heading}\n")
        
        # Check if all items are primitives (simple list)
        all_primitives = all(not isinstance(item, (dict, list)) for item in arr)
        
        if all_primitives:
            # Simple bullet list
            for item in arr:
                lines.append(f"- {item}")
            lines.append("")  # Empty line after list
        else:
            # Complex list with nested structures
            for i, item in enumerate(arr, 1):
                if isinstance(item, dict):
                    lines.append(f"### Item {i}\n")
                    lines.extend(self._convert_value(item, level + 2))
                elif isinstance(item, list):
                    lines.append(f"### Item {i}\n")
                    lines.extend(self._convert_value(item, level + 2))
                else:
                    lines.append(f"{i}. {item}")
            lines.append("")
        
        return lines
    
    def _convert_primitive(self, value: Any, key: str = None) -> List[str]:
        """Convert a primitive value to Markdown."""
        lines = []
        
        if key:
            formatted_key = self._format_key(key)
            
            # Handle multi-line strings
            if isinstance(value, str) and '\n' in value:
                lines.append(f"**{formatted_key}:**\n")
                for line in value.split('\n'):
                    lines.append(f"- {line}")
                lines.append("")
            else:
                lines.append(f"**{formatted_key}:** {value}\n")
        else:
            lines.append(f"{value}\n")
        
        return lines
    
    def _format_key(self, key: str) -> str:
        """
        Format a key name for display.
        
        Converts camelCase and snake_case to Title Case.
        """
        # Handle camelCase
        result = ""
        for i, char in enumerate(key):
            if char.isupper() and i > 0:
                result += " " + char
            else:
                result += char
        
        # Handle snake_case and kebab-case
        result = result.replace('_', ' ').replace('-', ' ')
        
        # Title case
        return result.title()


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python json_to_markdown.py <input.json> [output.md]")
        print("\nExample: python json_to_markdown.py data.json output.md")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    
    # Determine output file
    if len(sys.argv) >= 3:
        output_file = Path(sys.argv[2])
    else:
        output_file = input_file.with_suffix('.md')
    
    # Read JSON file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{input_file}': {e}")
        sys.exit(1)
    
    # Convert to Markdown
    converter = JSONToMarkdownConverter()
    
    # Use filename as title (without extension)
    title = input_file.stem.replace('_', ' ').replace('-', ' ').title()
    markdown = converter.convert(data, title=title)
    
    # Write output
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"✓ Successfully converted '{input_file}' to '{output_file}'")
    except IOError as e:
        print(f"Error: Could not write to '{output_file}': {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
