const fs = require('fs');
const path = require('path');

const initPath = path.join(__dirname, 'src/pages/iniciar.astro');
let content = fs.readFileSync(initPath, 'utf8');

const formMatch = content.match(/<form[\s\S]*?id="login-form"[\s\S]*?>([\s\S]*?)<\/form>/);
if (!formMatch) {
    console.log("No form found!");
    process.exit(1);
}

let formHtml = formMatch[1];

let finalComponent = `---
// src/components/LoginForm.astro
---

<form
  method="POST"
  action="/api/login"
  class="space-y-6"
  id="login-form"
>
${formHtml}
</form>
`;

fs.writeFileSync(path.join(__dirname, 'src/components/LoginForm.astro'), finalComponent);

// Replace in iniciar.astro
if (!content.includes('import LoginForm')) {
    content = content.replace('import Layout from "../layouts/Layout.astro";', 'import Layout from "../layouts/Layout.astro";\nimport LoginForm from "../components/LoginForm.astro";');
}
const formRegex = /<form[\s\S]*?id="login-form"[\s\S]*?>[\s\S]*?<\/form>/;
content = content.replace(formRegex, '<LoginForm />');

fs.writeFileSync(initPath, content);
console.log("LoginForm created and replaced!");
