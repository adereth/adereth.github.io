#!/usr/bin/env python3
"""
Generate RSS and Atom feeds for the blog
"""

import os
import json
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def prettify_xml(elem):
    """Return a pretty-printed XML string for the Element."""
    rough_string = tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ", encoding='utf-8').decode('utf-8')

def generate_rss_feed(posts, site_info):
    """Generate RSS 2.0 feed"""
    rss = Element('rss', version='2.0')
    channel = SubElement(rss, 'channel')
    
    # Channel metadata
    SubElement(channel, 'title').text = site_info['title']
    SubElement(channel, 'link').text = site_info['url']
    SubElement(channel, 'description').text = site_info['description']
    SubElement(channel, 'language').text = 'en-us'
    SubElement(channel, 'lastBuildDate').text = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')
    
    # Add posts (most recent first)
    sorted_posts = sorted(posts, key=lambda x: x['date'], reverse=True)
    
    for post in sorted_posts[:20]:  # Limit to 20 most recent posts
        item = SubElement(channel, 'item')
        SubElement(item, 'title').text = post['title']
        SubElement(item, 'link').text = site_info['url'].rstrip('/') + post['url']
        SubElement(item, 'description').text = post['content']
        
        # Parse date string back to datetime if needed
        if isinstance(post['date'], str):
            post_date = datetime.fromisoformat(post['date'].replace('Z', '+00:00'))
        else:
            post_date = post['date']
        
        SubElement(item, 'pubDate').text = post_date.strftime('%a, %d %b %Y %H:%M:%S +0000')
        SubElement(item, 'guid', isPermaLink='true').text = site_info['url'].rstrip('/') + post['url']
    
    return prettify_xml(rss)

def generate_atom_feed(posts, site_info):
    """Generate Atom 1.0 feed"""
    feed = Element('feed', xmlns='http://www.w3.org/2005/Atom')
    
    # Feed metadata
    SubElement(feed, 'title').text = site_info['title']
    SubElement(feed, 'id').text = site_info['url']
    
    link_self = SubElement(feed, 'link')
    link_self.set('href', site_info['url'] + 'atom.xml')
    link_self.set('rel', 'self')
    
    link_alt = SubElement(feed, 'link')
    link_alt.set('href', site_info['url'])
    link_alt.set('rel', 'alternate')
    
    SubElement(feed, 'updated').text = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    
    author = SubElement(feed, 'author')
    SubElement(author, 'name').text = site_info.get('author', 'Blog Author')
    
    # Add posts (most recent first)
    sorted_posts = sorted(posts, key=lambda x: x['date'], reverse=True)
    
    for post in sorted_posts[:20]:  # Limit to 20 most recent posts
        entry = SubElement(feed, 'entry')
        SubElement(entry, 'title').text = post['title']
        
        link = SubElement(entry, 'link')
        link.set('href', site_info['url'].rstrip('/') + post['url'])
        link.set('rel', 'alternate')
        
        SubElement(entry, 'id').text = site_info['url'].rstrip('/') + post['url']
        
        # Parse date string back to datetime if needed
        if isinstance(post['date'], str):
            post_date = datetime.fromisoformat(post['date'].replace('Z', '+00:00'))
        else:
            post_date = post['date']
        
        SubElement(entry, 'updated').text = post_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        SubElement(entry, 'published').text = post_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        content = SubElement(entry, 'content')
        content.set('type', 'html')
        content.text = post['content']
    
    return prettify_xml(feed)

def main():
    # Get the blog directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    blog_dir = os.path.dirname(script_dir)
    
    # Load posts data
    posts_data_file = os.path.join(script_dir, 'posts_data.json')
    if not os.path.exists(posts_data_file):
        print("No posts data found. Run build.py first.")
        return
    
    with open(posts_data_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)
    
    # Site information (could be loaded from a config file)
    site_info = {
        'title': 'Matt Adereth',
        'url': 'http://adereth.github.io/',
        'description': 'A blog about programming, mathematics, and making things',
        'author': 'Matt Adereth'
    }
    
    # Generate RSS feed
    rss_content = generate_rss_feed(posts, site_info)
    rss_file = os.path.join(blog_dir, 'feed.xml')
    with open(rss_file, 'w', encoding='utf-8') as f:
        f.write(rss_content)
    print(f"Generated RSS feed: {rss_file}")
    
    # Generate Atom feed
    atom_content = generate_atom_feed(posts, site_info)
    atom_file = os.path.join(blog_dir, 'atom.xml')
    with open(atom_file, 'w', encoding='utf-8') as f:
        f.write(atom_content)
    print(f"Generated Atom feed: {atom_file}")

if __name__ == '__main__':
    main()