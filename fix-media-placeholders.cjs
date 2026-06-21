const fs = require('fs');
const files = [
    'src/components/blocks/VideoBlock.tsx',
    'src/components/blocks/ImageBlock.tsx',
    'src/components/blocks/AudioBlock.tsx',
    'src/components/blocks/PdfBlock.tsx',
    'src/components/blocks/DocumentBlock.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the placeholder inline styles and events with className="media-placeholder"
    content = content.replace(/style=\{\{[\s\S]*?border:\s*"2px dashed #cbd5e1"[\s\S]*?\}\}\s*onMouseOver=\{\([^\}]+\}\s*onMouseOut=\{\([^\}]+\}/g, 'className="media-placeholder"');
    
    // Also remove the container's hardcoded background-color: "#f8fafc" and fix font family
    content = content.replace(/fontFamily:\s*"Inter, system-ui, sans-serif",\s*backgroundColor:\s*"#f8fafc",/g, 'fontFamily: "var(--font-family, system-ui, sans-serif)",\n\t\t\t\tbackgroundColor: "transparent",');
    
    // Fix caption input background
    content = content.replace(/borderTop:\s*"1px solid #f1f5f9",\s*backgroundColor:\s*"#ffffff",/g, 'borderTop: "1px solid var(--divider-color, #f1f5f9)",\n\t\t\t\t\t\tbackgroundColor: "transparent",');
    
    fs.writeFileSync(file, content);
}
