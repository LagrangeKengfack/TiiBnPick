import os
import re

service_dir = 'src/main/java/com/polytechnique/tiibntick/application/service'
test_dir = 'src/test/java/com/polytechnique/tiibntick/application/service'

os.makedirs(test_dir, exist_ok=True)

def generate_test_for_service(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract package
    pkg_match = re.search(r'package\s+([^;]+);', content)
    if not pkg_match: return
    pkg = pkg_match.group(1)
    
    # Extract class name
    cls_match = re.search(r'public\s+class\s+(\w+Service(?:Impl)?)\s*(?:implements\s+\w+\s*)?{', content)
    if not cls_match: return
    cls_name = cls_match.group(1)
    
    # Skip if test already exists
    test_filepath = os.path.join(test_dir, f"{cls_name}Test.java")
    if os.path.exists(test_filepath): return
    
    # Extract dependencies (fields)
    deps = []
    for line in content.split('\n'):
        if 'private final' in line and not 'static' in line:
            parts = line.strip().strip(';').split()
            if len(parts) >= 3:
                deps.append((parts[2], parts[3]))
                
    # Extract imports
    imports = set()
    for match in re.finditer(r'import\s+([^;]+);', content):
        imp = match.group(1)
        if not imp.startswith('java.') and not imp.startswith('lombok.') and not imp.startswith('org.springframework.'):
            imports.add(imp)
            
    # Generate test content
    test_content = f"package {pkg};\n\n"
    for imp in sorted(imports):
        test_content += f"import {imp};\n"
        
    test_content += "\nimport org.junit.jupiter.api.Test;\n"
    test_content += "import org.junit.jupiter.api.extension.ExtendWith;\n"
    test_content += "import org.mockito.InjectMocks;\n"
    test_content += "import org.mockito.Mock;\n"
    test_content += "import org.mockito.junit.jupiter.MockitoExtension;\n"
    test_content += "import static org.assertj.core.api.Assertions.assertThat;\n\n"
    
    test_content += "@ExtendWith(MockitoExtension.class)\n"
    test_content += f"class {cls_name}Test {{\n\n"
    
    for type_name, var_name in deps:
        test_content += f"    @Mock\n"
        test_content += f"    private {type_name} {var_name};\n\n"
        
    test_content += f"    @InjectMocks\n"
    test_content += f"    private {cls_name} service;\n\n"
    
    test_content += "    @Test\n"
    test_content += "    void contextLoads() {\n"
    test_content += "        assertThat(service).isNotNull();\n"
    test_content += "    }\n"
    test_content += "}\n"
    
    with open(test_filepath, 'w') as f:
        f.write(test_content)
    print(f"Generated {cls_name}Test.java")

for root, _, files in os.walk(service_dir):
    for file in files:
        if file.endswith('Service.java') or file.endswith('Impl.java'):
            generate_test_for_service(os.path.join(root, file))

