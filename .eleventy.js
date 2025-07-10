const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");

  // Adiciona collection de mods com dados da API da Modrinth
  eleventyConfig.addCollection("mods", async () => {
    const rawData = fs.readFileSync("mods.json");
    const modsBase = JSON.parse(rawData);

    const modsEnriquecidos = [];

    for (const mod of modsBase) {
      const { slug, version_tracker } = mod;
      try {
        const res = await fetch(`https://api.modrinth.com/v2/project/${slug}`);
        if (!res.ok) throw new Error(`Erro ao buscar ${slug}`);

        const apiData = await res.json();

        modsEnriquecidos.push({
          id: apiData.id,
          slug: slug,
          nome: apiData.title,
          descricao: apiData.description,
          icone: apiData.icon_url,
          categorias: apiData.categories,
          repo: apiData.source_url || null,
          versoes: version_tracker
        });
      } catch (e) {
        console.warn(`⚠️ Não foi possível buscar dados de "${slug}": ${e.message}`);
        // Fallback: insere apenas os dados do JSON
        modsEnriquecidos.push({
          id: null,
          slug: slug,
          nome: slug,
          descricao: "Não foi possível carregar a descrição.",
          icone: null,
          categorias: [],
          repo: null,
          versoes: version_tracker
        });
      }
    }

    return modsEnriquecidos;
  });

  // Versões únicas
  eleventyConfig.addCollection("versoes", async () => {
    const rawData = fs.readFileSync("mods.json");
    const mods = JSON.parse(rawData);
    const versoesSet = new Set();

    mods.forEach(mod => {
      mod.version_tracker.forEach(v => versoesSet.add(v));
    });

    return Array.from(versoesSet).sort();
  });

  // Filtro opcional para traduzir categorias
  eleventyConfig.addFilter("categoriaBonita", function (categoria) {
    const nomesBonitos = {
      "client": "Cliente",
      "utility": "Utilidade",
      "hud": "HUD",
      "optimization": "Otimização",
      "api": "API",
      "library": "Biblioteca",
      "decorative": "Decorativo",
      "misc": "Miscelânea",
      "decorations": "Decorações",
      "game-mechanics": "Mecânicas",
      "mobs": "Mobs",
      "storage": "Armazenamento",
      "management": "Gestão",
      "economy": "Economia",
      "adventure": "Aventura",
      "social": "Social",
      "decoration": "Decoração"
    };
    return nomesBonitos[categoria] || categoria;
  });

  // Copy `img/favicon/` to `_site/`
  /* eleventyConfig.addPassthroughCopy({ "src/img/favicon.ico": "favicon.ico" }); */
  /* eleventyConfig.addPassthroughCopy({ "src/img/ghost.png": "ghost.png" }); */

  eleventyConfig.addPlugin(eleventyImageTransformPlugin);

  // Copy `js/` to `_site/`
  /* eleventyConfig.addPassthroughCopy("src/js"); */

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    }
  };
};