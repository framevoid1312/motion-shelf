const fs=require('fs');const d=JSON.parse(fs.readFileSync('project.json','utf8'));fs.writeFileSync('project.js','window.project='+JSON.stringify(d).replace(/</g,'\\u003c')+';');
