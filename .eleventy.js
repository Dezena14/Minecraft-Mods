const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Image = require("@11ty/eleventy-img");

// --- Cache para os dados dos mods ---
let modsDataCache;
async function getEnrichedModsData() {
  if (modsDataCache) {
    return modsDataCache;
  }
  
  console.log("Buscando dados dos mods da API do Modrinth... (isso pode demorar um pouco)");

  const rawData = fs.readFileSync("mods.json");
  const modsBase = JSON.parse(rawData);
  const modsEnriquecidos = [];
  const USER_AGENT = 'Dezena14/Minecraft-Mods-Site (github.com/Dezena14/Minecraft-Mods)';

  for (const mod of modsBase) {
    const { slug, version_tracker = [] } = mod;
    
    try {
      const projectRes = await fetch(`https://api.modrinth.com/v2/project/${slug}`, { headers: { 'User-Agent': USER_AGENT } });
      if (!projectRes.ok) throw new Error(`Erro ao buscar projeto ${slug}`);
      const apiData = await projectRes.json();

      const versionsUrl = `https://api.modrinth.com/v2/project/${slug}/version?loaders=["fabric"]`;
      const versionsRes = await fetch(versionsUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!versionsRes.ok) throw new Error(`Erro ao buscar versoes de ${slug}`);
      const versionsData = await versionsRes.json();
      
      const versionMap = {};
      versionsData.forEach(versionFile => {
        versionFile.game_versions.forEach(gameVersion => {
          if (!versionMap[gameVersion]) {
            versionMap[gameVersion] = versionFile.id;
          }
        });
      });

      modsEnriquecidos.push({
        id: apiData.id, slug, nome: apiData.title, descricao: apiData.description,
        icone: apiData.icon_url, categorias: apiData.categories, repo: apiData.source_url || null,
        version_tracker: version_tracker,
        version_map: versionMap
      });

    } catch (e) {
      console.warn(`⚠️ Nao foi possivel buscar dados completos de "${slug}": ${e.message}`);
      modsEnriquecidos.push({
        id: null, slug, nome: slug, descricao: "Nao foi possivel carregar a descricao.",
        icone: null, categorias: [], repo: null, 
        version_tracker: version_tracker, 
        version_map: {}
      });
    }
  }
  
  console.log("✅ Dados dos mods carregados e cacheados.");
  modsDataCache = modsEnriquecidos;
  return modsDataCache;
}

module.exports = function (eleventyConfig) {
  // --- Arquivos para copiar ---
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // 👇 CORREÇÃO AQUI: O caminho agora aponta para dentro da pasta 'img' 👇
  eleventyConfig.addPassthroughCopy({ "src/img/favicon.ico": "/favicon.ico" });

  // --- Shortcode de Imagem ---
  eleventyConfig.addNunjucksAsyncShortcode("image", async function(src, alt, widths = [64]) {
    if (!src) return "";
    let srcFull = `./src/${src.replace(/^\//, "")}`;
    try {
      let metadata = await Image(srcFull, {
        widths, formats: ["webp", "jpeg"], outputDir: "./_site/img/", urlPath: "/img/",
      });
      let imageAttributes = { alt, loading: "lazy", decoding: "async" };
      return Image.generateHTML(metadata, imageAttributes);
    } catch (e) {
      console.error(`Erro ao processar imagem ${srcFull}:`, e);
      return "";
    }
  });

  eleventyConfig.addNunjucksAsyncShortcode("remoteImage", async function(src, alt, classes) {
    if (!src) {
      return "";
    }

    try {
      let metadata = await Image(src, {
        widths: [48, 96], // Gera tamanhos para telas normais e retina
        formats: ["webp", "auto"], // Gera WebP e o formato original como fallback
        outputDir: "./_site/img/mod-icons/", // Salva em uma subpasta organizada
        urlPath: "/img/mod-icons/",
        cacheOptions: {
          duration: "1w" // Guarda a imagem baixada por 1 semana antes de verificar de novo
        }
      });

      let imageAttributes = {
        alt,
        class: classes,
        loading: "lazy",
        decoding: "async",
      };

      return Image.generateHTML(metadata, imageAttributes);
    } catch (e) {
      console.warn(`⚠️ Erro ao processar imagem remota ${src}: ${e.message}`);
      // Em caso de erro, retorna uma imagem de fallback ou nada
      return `<div class="${classes}" style="background-color: var(--cor-borda);"></div>`;
    }
  });

  // --- Collections ---
  // (O resto do arquivo continua igual)
  eleventyConfig.addCollection("mods", async () => {
    return await getEnrichedModsData();
  });

  eleventyConfig.addCollection("versoes", () => {
    const rawData = fs.readFileSync("mods.json");
    const mods = JSON.parse(rawData);
    const versoesSet = new Set();
    mods.forEach(mod => { 
        if(mod.version_tracker) mod.version_tracker.forEach(v => versoesSet.add(v)) 
    });
    return Array.from(versoesSet).sort((a, b) => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      const maxLength = Math.max(partsA.length, partsB.length);
      for (let i = 0; i < maxLength; i++) {
        const partA = partsA[i] || 0;
        const partB = partsB[i] || 0;
        if (partA !== partB) { return partB - partA; }
      }
      return 0;
    });
  });

  eleventyConfig.addCollection("versoesAgrupadas", function() {
    const rawData = fs.readFileSync("mods.json");
    const mods = JSON.parse(rawData);
    const versoesSet = new Set();
    mods.forEach(mod => { if(mod.version_tracker) mod.version_tracker.forEach(v => versoesSet.add(v)) });
    const versoesFlat = Array.from(versoesSet).sort((a, b) => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      const maxLength = Math.max(partsA.length, partsB.length);
      for (let i = 0; i < maxLength; i++) {
        const partA = partsA[i] || 0;
        const partB = partsB[i] || 0;
        if (partA !== partB) { return partB - partA; }
      }
      return 0;
    });
    const grouped = new Map();
    versoesFlat.forEach(v => {
      const majorVersion = v.substring(0, v.lastIndexOf('.'));
      if (grouped.has(majorVersion)) {
        grouped.get(majorVersion).push(v);
      } else {
        grouped.set(majorVersion, [v]);
      }
    });
    return Array.from(grouped.entries());
  });
  
  eleventyConfig.addCollection("modCategories", async function() {
    const mods = await getEnrichedModsData();
    const categories = new Set();
    if (mods) {
      for (const mod of mods) {
        if (mod.categorias) {
          mod.categorias.forEach(category => categories.add(category));
        }
      }
    }
    return Array.from(categories).sort();
  });

  // --- Filtros ---
  eleventyConfig.addFilter("categoriaBonita", function (categoria) {
    const nomesBonitos = { "utility": "Utilidade", "hud": "HUD", "optimization": "Otimização", "library": "Biblioteca", "social": "Social", "management": "Gestão", "cosmetic": "Cosmético", "game-mechanics": "Mecânicas de jogo", "decoration": "Decoração", "adventure": "Aventura", "economy": "Economia" };
    return nomesBonitos[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
  });

  // --- Configuração de diretórios ---
  return {
    dir: {
      input: "src", includes: "_includes", data: "_data", output: "_site",
    }
  };
};