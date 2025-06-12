#!/usr/bin/env python3
"""
Main build script - runs build.py and generate_feed.py
"""

import subprocess
import sys
import os

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Building static site...")
    print("=" * 50)
    
    # Run build.py
    build_result = subprocess.run([sys.executable, os.path.join(script_dir, 'build.py')])
    if build_result.returncode != 0:
        print("Error: build.py failed")
        return 1
    
    print("\n" + "=" * 50)
    print("Generating feeds...")
    print("=" * 50)
    
    # Run generate_feed.py
    feed_result = subprocess.run([sys.executable, os.path.join(script_dir, 'generate_feed.py')])
    if feed_result.returncode != 0:
        print("Error: generate_feed.py failed")
        return 1
    
    print("\n" + "=" * 50)
    print("Build complete!")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())