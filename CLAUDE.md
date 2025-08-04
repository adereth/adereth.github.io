# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog and static site generator for Matt Adereth's technical blog. The site contains articles about programming, mathematics, and hardware projects. It uses a custom Python-based static site generator rather than Jekyll.

## Build Commands

### Generate Site
```bash
python bin/build.py
```
This processes all markdown files from `_posts/` and converts them to HTML, creating the blog structure under `/blog/`. It also generates an index page and saves post metadata to `bin/posts_data.json`.

### Generate RSS/Atom Feeds
```bash
python bin/generate_feed.py
```
This generates `feed.xml` (RSS) and `atom.xml` (Atom) feeds from the post data created by build.py.

### Full Build Process
```bash
python bin/build.py && python bin/generate_feed.py
```

## Architecture

### Static Site Generator (`bin/build.py`)
- **Front Matter Parser**: Extracts YAML metadata from markdown files
- **Post Processor**: Converts Jekyll-style posts (YYYY-MM-DD-title.markdown) to HTML
- **URL Structure**: Creates URLs as `/blog/YYYY/MM/DD/slug/index.html`
- **Index Generator**: Creates main index page with chronological post listing
- **Markdown Processing**: Uses Python markdown with codehilite extension
- **MathJax Support**: Configured for LaTeX math rendering (both inline `$` and display `$$`)

### Feed Generator (`bin/generate_feed.py`)
- Generates both RSS 2.0 and Atom 1.0 feeds
- Reads from `bin/posts_data.json` created by build.py
- Includes 20 most recent posts in feeds

### Content Structure
- `_posts/`: Jekyll-style blog posts with YAML front matter
- `about/`: About page content
- `images/`: Static images and assets
- `font/`: Font Awesome web fonts
- `data/`: JSON data files for visualizations
- `oneoff/`: Interactive demos and experiments (Girl Talk visualizations, etc.)
- `/blog/`: Generated HTML output for blog posts

### Styling
- Uses Lato font from Google Fonts
- Responsive design with max-width 720px content area
- Custom noise texture background
- Drop cap styling for first paragraph
- Code highlighting via codehilite

## Important Patterns

### URL Escaping Issue
The build script specifically handles escaped parentheses in markdown URLs (common from Jekyll/Octopress migration):
- Converts `\(` and `\)` to `(` and `)` in markdown links
- Only processes lines containing markdown links to avoid breaking LaTeX

### Jekyll/Octopress Compatibility
- Converts `{% img %}` tags to markdown image syntax
- Processes YAML front matter from Jekyll posts
- Maintains Jekyll-style post naming convention

### GitHub Pages Deployment
- `.nojekyll` file present to bypass Jekyll processing
- Site is served directly as static HTML