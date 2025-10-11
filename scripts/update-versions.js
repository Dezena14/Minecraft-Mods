// Arquivo: scripts\update-versions.js

const fs = require("fs");
const path = require("path");
const readline = require("readline-sync");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

// --- CONFIGURAÇÃO ---
const MODS_JSON_PATH = path.join(__dirname, "../mods.json");
const USER_AGENT =
    "Dezena14/Minecraft-Mods-Updater (github.com/Dezena14/Minecraft-Mods)";
const API_DELAY = 100;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readModsFile() {
    const rawData = fs.readFileSync(MODS_JSON_PATH, "utf-8");
    return JSON.parse(rawData);
}

function writeModsFile(data) {
    fs.writeFileSync(MODS_JSON_PATH, JSON.stringify(data, null, 2));
}

// Função de ordenação natural para versões
function naturalSort(a, b) {
    const re = /(\d+)/g;
    const ax = a.split(re).filter(Boolean);
    const bx = b.split(re).filter(Boolean);
    for (let i = 0; i < Math.min(ax.length, bx.length); i++) {
        const an = parseInt(ax[i], 10);
        const bn = parseInt(bx[i], 10);
        if (!isNaN(an) && !isNaN(bn)) {
            if (an < bn) return -1;
            if (an > bn) return 1;
        } else if (ax[i] < bx[i]) {
            return -1;
        } else if (ax[i] > bx[i]) {
            return 1;
        }
    }
    return ax.length - bx.length;
}

async function getRecentMinecraftVersions() {
    try {
        console.log("Buscando sugestoes de versoes do Minecraft...");
        const response = await fetch(
            "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
        );
        const data = await response.json();
        return data.versions
            .filter((v) => v.type === "release")
            .map((v) => v.id)
            .slice(0, 5);
    } catch (e) {
        console.error(
            "Nao foi possivel buscar as versoes do Minecraft. Usando padrao."
        );
        return ["1.21", "1.20"];
    }
}

async function updateExistingMods() {
    console.log("\n--- ATUALIZAR MODS EXISTENTES ---");

    const recentVersions = await getRecentMinecraftVersions();
    const versionsToCheckInput = readline.question(
        `Digite as versoes do MC para verificar (sugestao: ${recentVersions.join(
            ", "
        )}): `
    );
    const gameVersionsToCheck = versionsToCheckInput
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    if (gameVersionsToCheck.length === 0) {
        console.log("Nenhuma versao fornecida. Operacao cancelada.");
        return;
    }
    console.log(
        `OK! Verificando as versoes: ${gameVersionsToCheck.join(", ")}`
    );

    const mods = readModsFile();
    const allApiVersions = new Map();
    const allNewVersions = new Set();

    console.log("\nFase 1: Buscando dados de todos os mods...");
    for (const mod of mods) {
        if (!mod.version_tracker) mod.version_tracker = [];

        const apiUrl = `https://api.modrinth.com/v2/project/${
            mod.slug
        }/version?loaders=["fabric"]&game_versions=${JSON.stringify(
            gameVersionsToCheck
        )}`;
        try {
            const response = await fetch(apiUrl, {
                headers: { "User-Agent": USER_AGENT },
            });
            if (!response.ok)
                throw new Error(`API retornou status: ${response.status}`);
            const versionsData = await response.json();

            const supportedVersions = new Set();
            versionsData.forEach((v) => {
                v.game_versions
                    .filter((gv) => /^\d+\.\d+(\.\d+)?$/.test(gv))
                    .filter((gv) =>
                        gameVersionsToCheck.some((inputVersion) =>
                            gv.startsWith(inputVersion)
                        )
                    )
                    .forEach((gv) => supportedVersions.add(gv));
            });

            allApiVersions.set(mod.slug, Array.from(supportedVersions));

            Array.from(supportedVersions).forEach((v) => {
                if (!mod.version_tracker.includes(v)) {
                    allNewVersions.add(v);
                }
            });
        } catch (e) {
            console.error(
                ` ❌ Erro ao buscar dados para ${mod.slug}: ${e.message}`
            );
        }
        await delay(API_DELAY);
    }
    console.log(" ✅ Busca de dados concluida.");

    if (allNewVersions.size === 0) {
        console.log(
            "\nNenhuma nova versao encontrada para os filtros definidos. Sua curadoria esta atualizada!"
        );
        return;
    }

    console.log("\n--- Fase 2: Curadoria Interativa ---");
    const sortedNewVersions = Array.from(allNewVersions).sort(naturalSort);

    for (const newVersion of sortedNewVersions) {
        const input = readline.question(
            `\n---\n? Nova versao '${newVersion}' foi encontrada.\nDeseja revisar os mods para esta versao? (S/n): `
        );
        if (input.toLowerCase() !== "s") continue;

        for (const mod of mods) {
            const modApiVersions = allApiVersions.get(mod.slug) || [];
            if (
                modApiVersions.includes(newVersion) &&
                !mod.version_tracker.includes(newVersion)
            ) {
                const addInput = readline.question(
                    `  O mod '${mod.slug}' suporta a versao ${newVersion}. Adicionar? (S/n): `
                );
                if (addInput.toLowerCase() === "s") {
                    mod.version_tracker.push(newVersion);
                    console.log(`    ✔️  Adicionado.`);
                }
            }
        }
    }

    writeModsFile(mods);
    console.log("\n✅ Curadoria finalizada e mods.json salvo!");
}

async function addNewMod() {
    console.log("\n--- ADICIONAR NOVO MOD ---");
    const slug = readline.question(
        'Digite o "slug" do mod a ser adicionado (ex: sodium): '
    );
    if (!slug) {
        console.log("Slug invalido. Operacao cancelada.");
        return;
    }
    const mods = readModsFile();
    if (mods.some((m) => m.slug === slug)) {
        console.log(`O mod '${slug}' ja existe na sua lista.`);
        return;
    }

    try {
        const projectUrl = `https://api.modrinth.com/v2/project/${slug}`;
        const projectRes = await fetch(projectUrl, {
            headers: { "User-Agent": USER_AGENT },
        });
        if (!projectRes.ok)
            throw new Error(`Mod nao encontrado (status ${projectRes.status})`);

        const projectData = await projectRes.json();
        const confirmAdd = readline.question(
            `? Mod encontrado: '${projectData.title}'. Adicionar a curadoria? (S/n): `
        );

        if (confirmAdd.toLowerCase() === "s") {
            const newMod = { slug, version_tracker: [] };
            const recentVersions = await getRecentMinecraftVersions();
            const versionsToCheckInput = readline.question(
                `Digite as versoes do MC para verificar (sugestao: ${recentVersions.join(
                    ", "
                )}): `
            );
            const gameVersionsToCheck = versionsToCheckInput
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);

            if (gameVersionsToCheck.length > 0) {
                console.log(`Buscando versoes compativeis para '${slug}'...`);
                const versionsUrl = `https://api.modrinth.com/v2/project/${slug}/version?loaders=["fabric"]&game_versions=${JSON.stringify(
                    gameVersionsToCheck
                )}`;
                const versionsRes = await fetch(versionsUrl, {
                    headers: { "User-Agent": USER_AGENT },
                });
                const versionsData = await versionsRes.json();
                const supportedVersions = new Set();
                versionsData.forEach((v) => {
                    v.game_versions
                        .filter((gv) => /^\d+\.\d+(\.\d+)?$/.test(gv))
                        .filter((gv) =>
                            gameVersionsToCheck.some((inputVersion) =>
                                gv.startsWith(inputVersion)
                            )
                        )
                        .forEach((gv) => supportedVersions.add(gv));
                });

                if (supportedVersions.size === 0) {
                    console.log(
                        `Nenhuma versao compativel encontrada para '${slug}' nos filtros definidos.`
                    );
                } else {
                    console.log("--- Curadoria Inicial de Versoes ---");
                    Array.from(supportedVersions)
                        .sort(naturalSort)
                        .forEach((v) => {
                            const addVersion = readline.question(
                                `  '${slug}' suporta a versao ${v}. Adicionar? (s/n): `
                            );
                            if (addVersion.toLowerCase() === "s") {
                                newMod.version_tracker.push(v);
                            }
                        });
                }
            }

            mods.push(newMod);
            writeModsFile(mods);
            console.log(
                `\n✅ Mod '${slug}' adicionado com ${newMod.version_tracker.length} versoes e salvo no mods.json!`
            );
        } else {
            console.log("Operacao cancelada.");
        }
    } catch (e) {
        console.error(`❌ Erro: ${e.message}`);
    }
}

function mainMenu() {
    console.log("\n--- FERRAMENTA DE CURADORIA DE MODS ---");
    const choice = readline.question(
        "O que voce deseja fazer?\n" +
            "  (1) Atualizar versoes dos mods existentes\n" +
            "  (2) Adicionar um novo mod a curadoria\n" +
            "Digite sua escolha (1 ou 2): "
    );
    if (choice === "1") {
        updateExistingMods();
    } else if (choice === "2") {
        addNewMod();
    } else {
        console.log("Escolha invalida.");
    }
}

mainMenu();