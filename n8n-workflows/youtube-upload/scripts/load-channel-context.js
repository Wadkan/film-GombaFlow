const fs = require("node:fs");
const path = require("node:path");

const packageRoot = "/data/youtube-upload";
const commonRoot = "/data/common-skills";
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

function resolveCommonFile(value) {
  if (typeof value !== "string" || !path.isAbsolute(value)) {
    throw new Error("commonSkills entries must be absolute paths.");
  }
  const resolved = path.resolve(value);
  if (!resolved.startsWith(`${commonRoot}${path.sep}`)) {
    throw new Error("A commonSkills entry is outside /data/common-skills.");
  }
  return resolved;
}

try {
  if (!/^[A-Za-z0-9_-]+$/.test(channelKey)) {
    throw new Error("The selected channel key is invalid.");
  }

  const registryPath = path.join(packageRoot, "config", "channels.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  if (!Array.isArray(registry.channels) || !Array.isArray(registry.commonSkills)) {
    throw new Error("channels.json must contain channels and commonSkills lists.");
  }

  const channel = registry.channels.find((entry) => entry?.key === channelKey && entry.enabled);
  if (!channel) {
    throw new Error(`Enabled channel "${channelKey}" was not found in channels.json.`);
  }
  if (typeof channel.sourcePath !== "string" || !Array.isArray(channel.sourceFiles)) {
    throw new Error(`Channel "${channelKey}" is missing sourcePath or sourceFiles.`);
  }

  const channelRoot = resolveRelativeFile(packageRoot, channel.sourcePath, "sourcePath");
  const requestedFiles = [
    ...channel.sourceFiles.map((file) => resolveRelativeFile(channelRoot, file, "sourceFiles entry")),
    ...registry.commonSkills.map(resolveCommonFile),
  ];
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

  process.stdout.write(JSON.stringify({ ok: true, channelKey, files, missingFiles }));
} catch (error) {
  process.stderr.write(`Metaadat-források betöltése sikertelen: ${error?.message ?? String(error)}\n`);
  process.exitCode = 1;
}
