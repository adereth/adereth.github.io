#!/usr/bin/env python3
"""
Barebones static site generator
Processes markdown files into HTML
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path
import yaml
import markdown

def extract_front_matter(content):
    """Extract YAML front matter and content from markdown file"""
    if not content.startswith('---'):
        return {}, content
    
    try:
        # Find the closing --- for front matter
        end_match = re.search(r'\n---\s*\n', content[3:])
        if not end_match:
            return {}, content
        
        front_matter_text = content[3:end_match.start() + 3]
        remaining_content = content[end_match.end() + 3:]
        
        # Parse YAML
        front_matter = yaml.safe_load(front_matter_text) or {}
        return front_matter, remaining_content
    except:
        return {}, content

def parse_post_filename(filename):
    """Extract date and slug from post filename"""
    match = re.match(r'^(\d{4})-(\d{2})-(\d{2})-(.+)\.(markdown|md)$', filename)
    if match:
        year, month, day, slug, _ = match.groups()
        return {
            'year': year,
            'month': month,
            'day': day,
            'slug': slug,
            'date': datetime(int(year), int(month), int(day))
        }
    return None

def create_html_page(title, content, layout='post'):
    """Create a basic HTML page"""
    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="/style.css">
    <script>
    window.MathJax = {{
      tex: {{
        inlineMath: [['$', '$']],
        displayMath: [['$$', '$$']]
      }}
    }};
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
    <nav class="nav">
        <a href="/">Home</a>
        <a href="/about/">About</a>
        <a href="/feed.xml">RSS</a>
    </nav>
    <article>
        <h1>{title}</h1>
        {content}
    </article>
</body>
</html>"""
    
    return html_template.format(title=title, content=content)

def create_index_page(posts_data):
    """Create the main index page with all posts"""
    # Sort posts by date, newest first
    sorted_posts = sorted(posts_data, key=lambda x: x['date'], reverse=True)
    
    # Group posts by year
    posts_by_year = {}
    for post in sorted_posts:
        year = post['date'].year
        if year not in posts_by_year:
            posts_by_year[year] = []
        posts_by_year[year].append(post)
    
    # Build the HTML content
    content_parts = []
    
    for year in sorted(posts_by_year.keys(), reverse=True):
        content_parts.append(f'<h2>{year}</h2>')
        content_parts.append('<ul class="post-list">')
        
        for post in posts_by_year[year]:
            date_str = post['date'].strftime('%B %d')
            post_url = post['url']
            content_parts.append(f'<li><span class="date">{date_str}</span> <a href="{post_url}">{post["title"]}</a></li>')
        
        content_parts.append('</ul>')
    
    content = '\n'.join(content_parts)
    
    # Create the index page HTML
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matt Adereth - Blog</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <nav class="nav">
        <a href="/">Home</a>
        <a href="/about/">About</a>
        <a href="/feed.xml">RSS</a>
    </nav>
    <div class="container">
        <h1>Matt Adereth</h1>
        {content}
    </div>
</body>
</html>"""
    
    return html.format(content=content)

def process_blog_post(filepath, output_dir):
    """Process a blog post from _posts directory"""
    filename = os.path.basename(filepath)
    post_info = parse_post_filename(filename)
    
    if not post_info:
        print(f"Skipping {filename} - doesn't match post filename format")
        return None
    
    # Read and parse the file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    front_matter, markdown_content = extract_front_matter(content)
    
    # Fix escaped parentheses in URLs (common in Wikipedia links)
    markdown_content = re.sub(r'\\\)', ')', markdown_content)
    
    # Convert Jekyll/Octopress img tags to markdown images
    markdown_content = re.sub(r'{%\s*img\s+([^\s%]+)\s*%}', r'![](\1)', markdown_content)
    
    # Convert markdown to HTML
    md = markdown.Markdown(extensions=['extra', 'codehilite'])
    html_content = md.convert(markdown_content)
    
    # Get title from front matter or filename
    title = front_matter.get('title', post_info['slug'].replace('-', ' ').title())
    
    # Create output directory
    output_path = os.path.join(
        output_dir, 'blog',
        post_info['year'],
        post_info['month'],
        post_info['day'],
        post_info['slug']
    )
    os.makedirs(output_path, exist_ok=True)
    
    # Generate HTML
    html = create_html_page(title, html_content, front_matter.get('layout', 'post'))
    
    # Write output file
    output_file = os.path.join(output_path, 'index.html')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"Generated: {output_file}")
    
    # Return post data for feed generation
    return {
        'title': title,
        'date': post_info['date'],
        'url': f"/blog/{post_info['year']}/{post_info['month']}/{post_info['day']}/{post_info['slug']}/",
        'content': html_content,
        'front_matter': front_matter
    }

def process_regular_page(filepath, base_dir):
    """Process a regular markdown page (not in _posts)"""
    # Calculate relative path from base directory
    rel_path = os.path.relpath(filepath, base_dir)
    
    # Read and parse the file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    front_matter, markdown_content = extract_front_matter(content)
    
    # Fix escaped parentheses in URLs (common in Wikipedia links)
    markdown_content = re.sub(r'\\\)', ')', markdown_content)
    
    # Convert Jekyll/Octopress img tags to markdown images
    markdown_content = re.sub(r'{%\s*img\s+([^\s%]+)\s*%}', r'![](\1)', markdown_content)
    
    # Convert markdown to HTML
    md = markdown.Markdown(extensions=['extra', 'codehilite'])
    html_content = md.convert(markdown_content)
    
    # Get title from front matter or filename
    title = front_matter.get('title', Path(filepath).stem.replace('-', ' ').title())
    
    # Generate output path (same location, .html extension)
    output_path = os.path.splitext(rel_path)[0] + '.html'
    output_file = os.path.join(base_dir, output_path)
    
    # Create output directory if needed
    output_dir = os.path.dirname(output_file)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    # Generate HTML
    html = create_html_page(title, html_content, front_matter.get('layout', 'page'))
    
    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"Generated: {output_file}")

def find_markdown_files(directory, exclude_dirs=None):
    """Find all markdown files in directory, excluding certain subdirectories"""
    if exclude_dirs is None:
        exclude_dirs = {'_posts', 'blog', 'bin', '.git'}
    
    markdown_files = []
    
    for root, dirs, files in os.walk(directory):
        # Remove excluded directories from dirs to prevent descending into them
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith(('.markdown', '.md')) and not file.endswith('~'):
                markdown_files.append(os.path.join(root, file))
    
    return markdown_files

def main():
    # Get the blog directory (parent of bin/)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    blog_dir = os.path.dirname(script_dir)
    
    # Process blog posts
    posts_dir = os.path.join(blog_dir, '_posts')
    posts_data = []
    
    if os.path.exists(posts_dir):
        print("Processing blog posts...")
        for filename in os.listdir(posts_dir):
            if filename.endswith(('.markdown', '.md')) and not filename.endswith('~'):
                filepath = os.path.join(posts_dir, filename)
                post_data = process_blog_post(filepath, blog_dir)
                if post_data:
                    posts_data.append(post_data)
    
    # Process other markdown files
    print("\nProcessing other markdown pages...")
    other_markdown_files = find_markdown_files(blog_dir)
    
    for filepath in other_markdown_files:
        process_regular_page(filepath, blog_dir)
    
    # Generate index.html
    if posts_data:
        index_html = create_index_page(posts_data)
        index_file = os.path.join(blog_dir, 'index.html')
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(index_html)
        print(f"\nGenerated: {index_file}")
    
    # Save posts data for feed generation
    import json
    posts_data_file = os.path.join(blog_dir, 'bin', 'posts_data.json')
    with open(posts_data_file, 'w', encoding='utf-8') as f:
        json.dump(posts_data, f, default=str, indent=2)
    
    print(f"\nBuild complete! Processed {len(posts_data)} blog posts and {len(other_markdown_files)} other pages.")

if __name__ == '__main__':
    main()