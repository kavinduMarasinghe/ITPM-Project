import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/biyun/OneDrive/Desktop/Stall_Managment/Frontend/src';

const styleMap = {
  // Layout & Display
  "display: 'flex'": "flex",
  "display: 'grid'": "grid",
  "display: 'block'": "block",
  "display: 'inline-block'": "inline-block",
  "display: 'none'": "hidden",

  // Flexbox
  "flexDirection: 'column'": "flex-col",
  "flexDirection: 'row'": "flex-row",
  "alignItems: 'center'": "items-center",
  "alignItems: 'flex-start'": "items-start",
  "alignItems: 'flex-end'": "items-end",
  "justifyContent: 'space-between'": "justify-between",
  "justifyContent: 'center'": "justify-center",
  "justifyContent: 'flex-start'": "justify-start",
  "justifyContent: 'flex-end'": "justify-end",
  "flex: 1": "flex-1",
  "flexWrap: 'wrap'": "flex-wrap",

  // Spacing
  "gap: '0.25rem'": "gap-1",
  "gap: '0.5rem'": "gap-2",
  "gap: '0.75rem'": "gap-3",
  "gap: '1rem'": "gap-4",
  "gap: '1.25rem'": "gap-5",
  "gap: '1.5rem'": "gap-6",
  "gap: '2rem'": "gap-8",
  "gap: '3rem'": "gap-12",

  // Padding
  "padding: '0.25rem'": "p-1",
  "padding: '0.5rem'": "p-2",
  "padding: '0.75rem'": "p-3",
  "padding: '1rem'": "p-4",
  "padding: '1.5rem'": "p-6",
  "padding: '2rem'": "p-8",
  "padding: '3rem'": "p-12",

  // Margin
  "marginBottom: '0.25rem'": "mb-1",
  "marginBottom: '0.5rem'": "mb-2",
  "marginBottom: '0.75rem'": "mb-3",
  "marginBottom: '1rem'": "mb-4",
  "marginBottom: '1.5rem'": "mb-6",
  "marginBottom: '2rem'": "mb-8",
  "marginBottom: '3rem'": "mb-12",
  "marginTop: '0.25rem'": "mt-1",
  "marginTop: '0.5rem'": "mt-2",
  "marginTop: '0.75rem'": "mt-3",
  "marginTop: '1rem'": "mt-4",
  "marginTop: '1.5rem'": "mt-6",
  "marginTop: '2rem'": "mt-8",
  "marginTop: '3rem'": "mt-12",
  "margin: '0 auto'": "mx-auto",
  "margin: '0 auto 2rem'": "mx-auto mb-8",
  "margin: '0 auto 3rem'": "mx-auto mb-12",

  // Typography
  "fontWeight: '400'": "font-normal",
  "fontWeight: '500'": "font-medium",
  "fontWeight: '600'": "font-semibold",
  "fontWeight: '700'": "font-bold",
  "fontWeight: '800'": "font-extrabold",
  "fontWeight: '900'": "font-black",
  "fontSize: '0.75rem'": "text-xs",
  "fontSize: '0.8rem'": "text-[0.8rem]",
  "fontSize: '0.875rem'": "text-sm",
  "fontSize: '0.9rem'": "text-[0.9rem]",
  "fontSize: '1rem'": "text-base",
  "fontSize: '1.125rem'": "text-lg",
  "fontSize: '1.25rem'": "text-xl",
  "fontSize: '1.5rem'": "text-2xl",
  "fontSize: '1.75rem'": "text-[1.75rem]",
  "fontSize: '2rem'": "text-3xl",
  "fontSize: '3rem'": "text-5xl",
  "textAlign: 'center'": "text-center",
  "textAlign: 'left'": "text-left",
  "textAlign: 'right'": "text-right",
  "textTransform: 'uppercase'": "uppercase",
  "textTransform: 'lowercase'": "lowercase",
  "textDecoration: 'none'": "no-underline",
  "textDecoration: 'underline'": "underline",
  "lineHeight: '1'": "leading-none",
  "lineHeight: '1.25'": "leading-tight",
  "lineHeight: '1.5'": "leading-normal",
  "lineHeight: '1.75'": "leading-relaxed",
  "lineHeight: '2'": "leading-loose",

  // Colors - Custom SLIIT colors
  "color: 'var(--sliit-navy)'": "text-sliit-navy",
  "color: 'var(--sliit-orange)'": "text-sliit-orange",
  "color: 'var(--sliit-green)'": "text-sliit-green",
  "backgroundColor: 'var(--sliit-navy)'": "bg-sliit-navy",
  "backgroundColor: 'var(--sliit-orange)'": "bg-sliit-orange",
  "backgroundColor: 'var(--sliit-green)'": "bg-sliit-green",

  // Colors - Standard
  "color: 'var(--gray-500)'": "text-slate-500",
  "color: 'var(--gray-900)'": "text-slate-900",
  "color: 'white'": "text-white",
  "color: 'black'": "text-black",
  "backgroundColor: 'var(--white)'": "bg-white",
  "backgroundColor: 'white'": "bg-white",
  "backgroundColor: 'transparent'": "bg-transparent",

  // Grid
  "gridTemplateColumns: '1fr 1fr'": "grid-cols-2",
  "gridTemplateColumns: 'repeat(2, 1fr)'": "grid-cols-2",
  "gridTemplateColumns: 'repeat(3, 1fr)'": "grid-cols-3",
  "gridTemplateColumns: 'repeat(4, 1fr)'": "grid-cols-4",
  "gridColumn: '1 / -1'": "col-span-full",

  // Sizing
  "maxWidth: '1400px'": "max-w-[1400px]",
  "maxWidth: '1200px'": "max-w-[1200px]",
  "maxWidth: '800px'": "max-w-[800px]",
  "maxWidth: '600px'": "max-w-[600px]",
  "maxWidth: '560px'": "max-w-[560px]",
  "maxWidth: '400px'": "max-w-[400px]",
  "width: '100%'": "w-full",
  "height: '100%'": "h-full",

  // Borders
  "borderRadius: '4px'": "rounded",
  "borderRadius: '6px'": "rounded-md",
  "borderRadius: '8px'": "rounded-lg",
  "borderRadius: '10px'": "rounded-xl",
  "borderRadius: '12px'": "rounded-2xl",
  "borderRadius: '16px'": "rounded-3xl",
  "borderRadius: '9999px'": "rounded-full",
  "border: 'none'": "border-none",
  "border: '1px solid var(--border)'": "border",

  // Effects
  "opacity: 0.5": "opacity-50",
  "opacity: 0.7": "opacity-70",
  "opacity: 1": "opacity-100",

  // Position
  "position: 'relative'": "relative",
  "position: 'absolute'": "absolute",
  "position: 'fixed'": "fixed",

  // Overflow
  "overflow: 'hidden'": "overflow-hidden",
  "overflow: 'auto'": "overflow-auto",
  "overflow: 'scroll'": "overflow-scroll"
};

function getFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('style={{') || content.includes('style={')) {
        files.push(fullPath);
      }
    }
  });
  return files;
}

function convertInlineStyles(content) {
  // Pattern 1: className="existing" style={{ prop: 'value', ... }}
  content = content.replace(/className=["']([^"']*)["']\s*style=\{\{\s*([^}]+)\s*\}\}/g, (match, classNames, inner) => {
    let props = inner.split(',').map(p => p.trim()).filter(p => p.length > 0);
    let newTailwind = [];
    let remainingProps = [];

    props.forEach(prop => {
      const trimmedProp = prop.trim();
      if (styleMap[trimmedProp]) {
        newTailwind.push(styleMap[trimmedProp]);
      } else {
        // Handle dynamic values and custom properties
        if (trimmedProp.includes('color:')) {
          if (trimmedProp.includes('var(--sliit-navy)')) newTailwind.push('text-sliit-navy');
          else if (trimmedProp.includes('var(--sliit-orange)')) newTailwind.push('text-sliit-orange');
          else if (trimmedProp.includes('var(--sliit-green)')) newTailwind.push('text-sliit-green');
          else if (trimmedProp.includes('var(--gray-500)')) newTailwind.push('text-slate-500');
          else if (trimmedProp.includes('var(--gray-900)')) newTailwind.push('text-slate-900');
          else if (trimmedProp.includes('white')) newTailwind.push('text-white');
          else remainingProps.push(trimmedProp);
        } else if (trimmedProp.includes('background') || trimmedProp.includes('backgroundColor')) {
          if (trimmedProp.includes('var(--sliit-navy)')) newTailwind.push('bg-sliit-navy');
          else if (trimmedProp.includes('var(--sliit-orange)')) newTailwind.push('bg-sliit-orange');
          else if (trimmedProp.includes('var(--sliit-green)')) newTailwind.push('bg-sliit-green');
          else if (trimmedProp.includes('white') || trimmedProp.includes('var(--white)')) newTailwind.push('bg-white');
          else remainingProps.push(trimmedProp);
        } else {
          remainingProps.push(trimmedProp);
        }
      }
    });

    const builtClassName = (classNames + " " + newTailwind.join(' ')).trim();
    if (remainingProps.length === 0) {
      return `className="${builtClassName}"`;
    } else {
      return `className="${builtClassName}" style={{ ${remainingProps.join(', ')} }}`;
    }
  });

  // Pattern 2: <Tag style={{ prop: 'value', ... }}
  content = content.replace(/<([a-zA-Z][a-zA-Z0-9]*)\s+style=\{\{\s*([^}]+)\s*\}\}/g, (match, tag, inner) => {
    let props = inner.split(',').map(p => p.trim()).filter(p => p.length > 0);
    let newTailwind = [];
    let remainingProps = [];

    props.forEach(prop => {
      const trimmedProp = prop.trim();
      if (styleMap[trimmedProp]) {
        newTailwind.push(styleMap[trimmedProp]);
      } else {
        // Handle dynamic values and custom properties
        if (trimmedProp.includes('color:')) {
          if (trimmedProp.includes('var(--sliit-navy)')) newTailwind.push('text-sliit-navy');
          else if (trimmedProp.includes('var(--sliit-orange)')) newTailwind.push('text-sliit-orange');
          else if (trimmedProp.includes('var(--sliit-green)')) newTailwind.push('text-sliit-green');
          else if (trimmedProp.includes('var(--gray-500)')) newTailwind.push('text-slate-500');
          else if (trimmedProp.includes('var(--gray-900)')) newTailwind.push('text-slate-900');
          else if (trimmedProp.includes('white')) newTailwind.push('text-white');
          else remainingProps.push(trimmedProp);
        } else if (trimmedProp.includes('background') || trimmedProp.includes('backgroundColor')) {
          if (trimmedProp.includes('var(--sliit-navy)')) newTailwind.push('bg-sliit-navy');
          else if (trimmedProp.includes('var(--sliit-orange)')) newTailwind.push('bg-sliit-orange');
          else if (trimmedProp.includes('var(--sliit-green)')) newTailwind.push('bg-sliit-green');
          else if (trimmedProp.includes('white') || trimmedProp.includes('var(--white)')) newTailwind.push('bg-white');
          else remainingProps.push(trimmedProp);
        } else {
          remainingProps.push(trimmedProp);
        }
      }
    });

    if (newTailwind.length === 0) return match;

    if (remainingProps.length === 0) {
      return `<${tag} className="${newTailwind.join(' ')}"`;
    } else {
      return `<${tag} className="${newTailwind.join(' ')}" style={{ ${remainingProps.join(', ')} }}`;
    }
  });

  return content;
}

// Main execution
console.log('🔄 Starting inline CSS removal and Tailwind conversion...');

const files = getFiles(dir);
console.log(`📁 Found ${files.length} files with inline styles`);

files.forEach(file => {
  console.log(`🔧 Processing: ${path.relative(dir, file)}`);
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  content = convertInlineStyles(content);

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✅ Updated: ${path.relative(dir, file)}`);
  } else {
    console.log(`⚪ No changes needed: ${path.relative(dir, file)}`);
  }
});

console.log('🎉 Successfully completed inline CSS removal!');
console.log('💡 All inline styles have been converted to Tailwind classes where possible.');
console.log('📝 Any remaining inline styles are complex properties that need manual conversion.');
