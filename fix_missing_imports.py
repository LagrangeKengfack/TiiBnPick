import os
import re

test_dir = 'src/test/java/com/polytechnique/tiibntick/application/service'

def fix_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    if 'PasswordEncoder' in content and 'import org.springframework.security.crypto.password.PasswordEncoder;' not in content:
        content = content.replace('import org.junit.jupiter.api.Test;', 'import org.springframework.security.crypto.password.PasswordEncoder;\nimport org.junit.jupiter.api.Test;')
        
    if 'JavaMailSender' in content and 'import org.springframework.mail.javamail.JavaMailSender;' not in content:
        content = content.replace('import org.junit.jupiter.api.Test;', 'import org.springframework.mail.javamail.JavaMailSender;\nimport org.junit.jupiter.api.Test;')
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk(test_dir):
    for f in files:
        if f.endswith('.java'):
            fix_imports(os.path.join(root, f))
