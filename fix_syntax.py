#!/usr/bin/env python3
import re

with open(r'c:\Users\bsean\OneDrive\Documents\.blackbox\Coetus-App-1-OwlbanGroup\.chocolatey\owlbangroup.io\NOVA-BLOCKS\nova_blocks\backend\index.js', 'r') as f:
    content = f.read()

# The outer try block (starting at line 172) is missing its catch.
# We need to add a catch block after the inner try-catch closes.
# Current pattern: after the inner catch closes, there's just '}' closing the outer try.
# We need to add: '} catch (error) { ... }' before the outer closing '}'

# Find the pattern and replace
# Looking for: "  }\n}" followed by ");" at the end of the route handler
# Actually, let's find the specific location: after line 216 "  }" and line 217 "}"

# Replace the pattern at the end of the predict route handler
old_pattern = '  }\\n}\\n// Blackwell'
new_pattern = '  } catch (error) {\\n    res.status(500).json({ error: \\'Model validation failed\\', details: error.message });\\n  }\\n// Blackwell'

if old_pattern in content:
    content = content.replace(old_pattern, new_pattern)
    with open(r'c:\Users\bsean\OneDrive\Documents\.blackbox\Coetus-App-1-OwlbanGroup\.chocolatey\owlbangroup.io\NOVA-BLOCKS\nova_blocks\backend\index.js', 'w') as f:
        f.write(content)
    print('Fixed!')
else:
    print('Pattern not found, trying alternative...')
    # Try another pattern
    old_pattern2 = '  }\\n}\\n};'
    new_pattern2 = '  } catch (error) {\\n    res.status(500).json({ error: \\'Model validation failed\\', details: error.message });\\n  }\\n};'
    if old_pattern2 in content:
        content = content.replace(old_pattern2, new_pattern2)
        with open(r'c:\Users\bsean\OneDrive\Documents\.blackbox\Coetus-App-1-OwlbanGroup\.chocolatey\owlbangroup.io\NOVA-BLOCKS\nova_blocks\backend\index.js', 'w') as f:
            f.write(content)
        print('Fixed with alternative pattern!')
    else:
        print('Alternative pattern not found either')