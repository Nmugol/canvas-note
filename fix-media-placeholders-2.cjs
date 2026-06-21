const fs = require('fs');

const replacement = `\t\t\t\t\tclassName="media-placeholder"`;

const filesToFix = [
    {
        name: 'src/components/blocks/AudioBlock.tsx',
        search: `\t\t\t\t\tstyle={{\n\t\t\t\t\t\tflex: 1,\n\t\t\t\t\t\tdisplay: "flex",\n\t\t\t\t\t\tflexDirection: "column",\n\t\t\t\t\t\talignItems: "center",\n\t\t\t\t\t\tjustifyContent: "center",\n\t\t\t\t\t\tborder: "2px dashed #cbd5e1",\n\t\t\t\t\t\tborderRadius: "8px",\n\t\t\t\t\t\tmargin: "12px",\n\t\t\t\t\t\tcursor: "pointer",\n\t\t\t\t\t\ttransition: "all 0.2s ease",\n\t\t\t\t\t\tbackgroundColor: "#ffffff",\n\t\t\t\t\t}}\n\t\t\t\t\tonMouseOver={(e) => {\n\t\t\t\t\t\te.currentTarget.style.borderColor = "#4f46e5";\n\t\t\t\t\t\te.currentTarget.style.backgroundColor = "#f5f3ff";\n\t\t\t\t\t}}\n\t\t\t\t\tonMouseOut={(e) => {\n\t\t\t\t\t\te.currentTarget.style.borderColor = "#cbd5e1";\n\t\t\t\t\t\te.currentTarget.style.backgroundColor = "#ffffff";\n\t\t\t\t\t}}`
    },
    {
        name: 'src/components/blocks/PdfBlock.tsx',
        search: `\t\t\t\t\tstyle={{\n\t\t\t\t\t\tflex: 1,\n\t\t\t\t\t\tdisplay: "flex",\n\t\t\t\t\t\tflexDirection: "column",\n\t\t\t\t\t\talignItems: "center",\n\t\t\t\t\t\tjustifyContent: "center",\n\t\t\t\t\t\tborder: "2px dashed #cbd5e1",\n\t\t\t\t\t\tborderRadius: "8px",\n\t\t\t\t\t\tmargin: "12px",\n\t\t\t\t\t\tcursor: "pointer",\n\t\t\t\t\t\ttransition: "all 0.2s ease",\n\t\t\t\t\t\tbackgroundColor: "#ffffff",\n\t\t\t\t\t}}\n\t\t\t\t\tonMouseOver={(e) => {\n\t\t\t\t\t\te.currentTarget.style.borderColor = "#4f46e5";\n\t\t\t\t\t\te.currentTarget.style.backgroundColor = "#f5f3ff";\n\t\t\t\t\t}}\n\t\t\t\t\tonMouseOut={(e) => {\n\t\t\t\t\t\te.currentTarget.style.borderColor = "#cbd5e1";\n\t\t\t\t\t\te.currentTarget.style.backgroundColor = "#ffffff";\n\t\t\t\t\t}}`
    },
    {
        name: 'src/components/blocks/DocumentBlock.tsx',
        search: `\t\t\t\t\tstyle={{\n\t\t\t\t\t\tflex: 1,\n\t\t\t\t\t\tdisplay: "flex",\n\t\t\t\t\t\tflexDirection: "column",\n\t\t\t\t\t\talignItems: "center",\n\t\t\t\t\t\tjustifyContent: "center",\n\t\t\t\t\t\tborder: "2px dashed #cbd5e1",\n\t\t\t\t\t\tborderRadius: "8px",\n\t\t\t\t\t\tmargin: "12px",\n\t\t\t\t\t\tcursor: "pointer",\n\t\t\t\t\t\ttransition: "all 0.2s ease",\n\t\t\t\t\t\tbackgroundColor: "#ffffff",\n\t\t\t\t\t}}\n\t\t\t\t\tonMouseOver={(e) => {\n\t\t\t\t\t\te.currentTarget.style.borderColor = "#4f46e5";\n\t\t\t\t\t\te.currentTarget.style.backgroundColor = "#f5f3ff";\n\t\t\t\t\t}}\n\t\t\t\t\tonMouseOut={(e) => {\n\t\t\t\t\t\te.currentTarget.style.borderColor = "#cbd5e1";\n\t\t\t\t\t\te.currentTarget.style.backgroundColor = "#ffffff";\n\t\t\t\t\t}}`
    }
];

for (const file of filesToFix) {
    if (!fs.existsSync(file.name)) continue;
    let content = fs.readFileSync(file.name, 'utf8');
    if (content.includes(file.search)) {
        content = content.replace(file.search, replacement);
        fs.writeFileSync(file.name, content);
        console.log("Fixed " + file.name);
    } else {
        console.log("Could not find exact match in " + file.name);
    }
}
