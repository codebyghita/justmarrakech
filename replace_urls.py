import os

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace(old_str, new_str)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

root_dir = 'frontend/src'
old_url = 'http://127.0.0.1:8000'
# Use empty string to make URLs relative, e.g. /api/public/...
new_url = ''

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            replace_in_file(os.path.join(root, file), old_url, new_url)
