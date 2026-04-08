#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const checkOnly = process.argv.includes('--check');

const metadataPath = path.join(rootDir, 'metadata.json');
const packageJsonPath = path.join(rootDir, 'package.json');
const docsPackageJsonPath = path.join(rootDir, 'documentation', 'package.json');
const manifestPath = path.join(rootDir, 'public', 'manifest.json');
const readmePath = path.join(rootDir, 'README.md');
const releasePleaseManifestPath = path.join(rootDir, '.release-please-manifest.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  return JSON.stringify(data, null, 2) + '\n';
}

function normalizeRootPath(filePath) {
  return path.relative(rootDir, filePath) || filePath;
}

function assertMetadata(metadata) {
  const requiredPaths = [
    ['version'],
    ['product', 'packageName'],
    ['product', 'name'],
    ['product', 'tagline'],
    ['product', 'manifestDescription'],
    ['extension', 'defaultTitle'],
    ['links', 'github'],
    ['links', 'docs'],
    ['links', 'support'],
    ['docs', 'title'],
    ['docs', 'tagline'],
    ['docs', 'url'],
    ['docs', 'baseUrl'],
    ['docs', 'organizationName'],
    ['docs', 'projectName'],
    ['docs', 'editPath'],
  ];

  for (const requiredPath of requiredPaths) {
    let cursor = metadata;
    for (const part of requiredPath) {
      cursor = cursor?.[part];
    }

    if (typeof cursor !== 'string' || cursor.trim().length === 0) {
      const keyPath = requiredPath.join('.');
      throw new Error(`metadata.json is missing a non-empty string for "${keyPath}"`);
    }
  }
}

function withVersionBadge(readmeContent, version) {
  const shieldVersion = version.replaceAll('-', '--');
  const badgeRegex = /img\.shields\.io\/badge\/version-[^?"\s]+\?style=flat-square/g;
  return readmeContent.replaceAll(
    badgeRegex,
    `img.shields.io/badge/version-${shieldVersion}-blue?style=flat-square`
  );
}

function planUpdate(filePath, nextContent, plannedUpdates) {
  const currentContent = fs.readFileSync(filePath, 'utf8');
  if (currentContent !== nextContent) {
    plannedUpdates.push({ filePath, nextContent });
  }
}

function main() {
  const metadata = readJson(metadataPath);
  assertMetadata(metadata);

  const packageJson = readJson(packageJsonPath);
  packageJson.name = metadata.product.packageName;
  packageJson.version = metadata.version;
  packageJson.description = metadata.product.tagline;

  const docsPackageJson = readJson(docsPackageJsonPath);
  docsPackageJson.version = metadata.version;

  const manifest = readJson(manifestPath);
  manifest.name = metadata.product.name;
  manifest.version = metadata.version;
  manifest.description = metadata.product.manifestDescription;
  manifest.action = manifest.action ?? {};
  manifest.action.default_title = metadata.extension.defaultTitle;

  const readme = fs.readFileSync(readmePath, 'utf8');
  const nextReadme = withVersionBadge(readme, metadata.version);

  const releasePleaseManifest = fs.existsSync(releasePleaseManifestPath)
    ? readJson(releasePleaseManifestPath)
    : {};
  releasePleaseManifest['.'] = metadata.version;

  const plannedUpdates = [];
  planUpdate(packageJsonPath, writeJson(packageJsonPath, packageJson), plannedUpdates);
  planUpdate(docsPackageJsonPath, writeJson(docsPackageJsonPath, docsPackageJson), plannedUpdates);
  planUpdate(manifestPath, writeJson(manifestPath, manifest), plannedUpdates);
  planUpdate(readmePath, nextReadme, plannedUpdates);
  planUpdate(
    releasePleaseManifestPath,
    writeJson(releasePleaseManifestPath, releasePleaseManifest),
    plannedUpdates
  );

  if (plannedUpdates.length === 0) {
    console.log(`metadata sync: no changes (${checkOnly ? 'check mode' : 'write mode'})`);
    return;
  }

  if (checkOnly) {
    console.error('metadata sync check failed. Run "npm run metadata:sync" to update:');
    for (const update of plannedUpdates) {
      console.error(` - ${normalizeRootPath(update.filePath)}`);
    }
    process.exit(1);
  }

  for (const update of plannedUpdates) {
    fs.writeFileSync(update.filePath, update.nextContent, 'utf8');
    console.log(`updated ${normalizeRootPath(update.filePath)}`);
  }
}

main();
