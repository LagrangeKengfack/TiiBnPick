import os

replacements = {
    "package com.polytechnique.tiibntick.services;": "package com.polytechnique.tiibntick.application.service;",
    "package com.polytechnique.tiibntick.controllers;": "package com.polytechnique.tiibntick.infrastructure.web.controller;",
    "import com.polytechnique.tiibntick.services.": "import com.polytechnique.tiibntick.application.service.",
    "import com.polytechnique.tiibntick.controllers.": "import com.polytechnique.tiibntick.infrastructure.web.controller.",
    "import com.polytechnique.tiibntick.models.": "import com.polytechnique.tiibntick.domain.model.",
    "import com.polytechnique.tiibntick.dtos.": "import com.polytechnique.tiibntick.infrastructure.web.dto.",
    "import com.polytechnique.tiibntick.repositories.": "import com.polytechnique.tiibntick.domain.port.out.",
    "import com.polytechnique.tiibntick.exceptions.": "import com.polytechnique.tiibntick.domain.exception."
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)

for root, dirs, files in os.walk('src/test/java'):
    for f in files:
        if f.endswith('.java'):
            process_file(os.path.join(root, f))
