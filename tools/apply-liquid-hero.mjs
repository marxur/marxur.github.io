import fs from 'node:fs';
import {liquidHero,liquidAssets} from './editorial/liquid-hero.mjs';
let html=fs.readFileSync('index.html','utf8');
if(html.includes('id="inicio"'))html=html.replace(/<section class="liquid-hero"[\s\S]*?<\/section>/,()=>liquidHero());
else html=html.replace('<body>','<body>'+liquidHero());
if(!html.includes('href="/liquid-type.css'))html=html.replace('</head>',liquidAssets+'</head>');
html=html.replace('<h1>El periódico de la inteligencia artificial</h1>','<h2>El periódico de la inteligencia artificial</h2>');
fs.writeFileSync('index.html',html);
console.log('Interactive opening applied; original news retained.');
