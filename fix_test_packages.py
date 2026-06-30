import os
import re
import shutil

test_dir = 'src/test/java/com/polytechnique/tiibntick/application/service'
base_src_dir = 'src/test/java'

for root, _, files in os.walk(test_dir):
    for f in files:
        if not f.endswith('.java'): continue
        filepath = os.path.join(root, f)
        
        with open(filepath, 'r') as file:
            content = file.read()
            
        pkg_match = re.search(r'package\s+([^;]+);', content)
        if pkg_match:
            pkg = pkg_match.group(1)
            target_dir = os.path.join(base_src_dir, pkg.replace('.', '/'))
            os.makedirs(target_dir, exist_ok=True)
            
            target_filepath = os.path.join(target_dir, f)
            if filepath != target_filepath:
                shutil.move(filepath, target_filepath)

