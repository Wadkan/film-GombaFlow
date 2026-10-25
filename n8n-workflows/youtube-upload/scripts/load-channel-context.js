const fs = require("node:fs");
const path = require("node:path");

const packageRoot = "/data/youtube-upload";
const channelKey = process.argv[2] ?? "";

function resolveRelativeFile(base, value, description) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value)) {
    throw new Error(`${description} must be a non-empty relative path.`);
  }
  const resolved = path.resolve(base, value);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error(`${description} is outside its allowed directory.`);
  }
  return resolved;
}

try {
  if (!/^[A-Za-z0-9_-]+$/.test(channelKey)) {
    throw new Error("The selected channel key is invalid.");
  }

  const registryPath = path.join(packageRoot, "config", "channels.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const settingsPath = path.join(packageRoot, "config", "settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (typeof settings.timezone !== "string" || settings.timezone.length === 0) {
    throw new Error("settings.json must contain a timezone.");
  }
  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: settings.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const currentDate = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
  const localDate = `${currentDate.year}-${currentDate.month}-${currentDate.day}`;
  if (!Array.isArray(registry.channels)) {
    throw new Error("channels.json must contain a channels list.");
  }

  const channel = registry.channels.find((entry) => entry?.key === channelKey && entry.enabled);
  if (!channel) {
    throw new Error(`Enabled channel "${channelKey}" was not found in channels.json.`);
  }
  if (typeof channel.sourcePath !== "string" || !Array.isArray(channel.sourceFiles)) {
    throw new Error(`Channel "${channelKey}" is missing sourcePath or sourceFiles.`);
  }

  const channelRoot = resolveRelativeFile(packageRoot, channel.sourcePath, "sourcePath");
  const requestedFiles = channel.sourceFiles.map((file) => resolveRelativeFile(channelRoot, file, "sourceFiles entry"));
  const uniqueFiles = [...new Set(requestedFiles)];
  const files = [];
  const missingFiles = [];

  for (const filePath of uniqueFiles) {
    try {
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) {
        missingFiles.push(filePath);
        continue;
      }
      files.push({ path: filePath, content: fs.readFileSync(filePath, "utf8") });
    } catch (error) {
      if (error?.code === "ENOENT") {
        missingFiles.push(filePath);
        continue;
      }
      throw error;
    }
  }

  files.unshift({
    path: "Workflow által átadott aktuális dátum",
    content: `Aktuális dátum: ${localDate}\nIdőzóna: ${settings.timezone}\nA relatív publikálási dátumot ehhez viszonyítsd. A videó és a videómappa neve nem aktuális dátumforrás.`,
  });

  process.stdout.write(JSON.stringify({ ok: true, channelKey, files, missingFiles }));
} catch (error) {
  process.stderr.write(`Metaadat-források betöltése sikertelen: ${error?.message ?? String(error)}\n`);
  process.exitCode = 1;
}
