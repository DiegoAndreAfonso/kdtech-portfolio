import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

// Use the same typed content as the application for static route metadata.
const source = await readFile(resolve("src/data.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { projects, contactConfig } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
let html = await readFile(resolve("dist/index.html"), "utf8");
const origin = contactConfig.siteUrl || process.env.SITE_ORIGIN;
function pageMetadata(template, title, description, pathname, image) {
  let page = template
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,
      (_, start, end) => `${start}${escape(description)}${end}`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*("\s*\/?>)/,
      `$1${escape(title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/,
      (_, start, end) => `${start}${escape(description)}${end}`,
    );
  if (origin) {
    const url = escape(new URL(pathname, origin).href);
    const tags =
      `<link rel="canonical" href="${url}" /><meta property="og:url" content="${url}" />` +
      (image
        ? `<meta property="og:image" content="${escape(new URL(image, origin).href)}" />`
        : "");
    page = page.replace("</head>", `${tags}</head>`);
  }
  return page;
}
for (const project of projects) {
  const description =
    project.summary ||
    [project.name + ".", project.origin, project.credit]
      .filter(Boolean)
      .join(" ");
  const pathname = `/projetos/${project.id}`;
  const page = pageMetadata(
    html,
    `${project.name} — KDTech`,
    description,
    pathname,
    project.images?.[0]?.src,
  );
  const directory = resolve("dist/projetos", project.id);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), page);
}
if (origin) {
  html = pageMetadata(
    html,
    "KDTech — Ideias que viram soluções",
    "Conheça a KDTech: desenvolvimento de software aplicado à gestão, à educação e à organização de processos.",
    "/",
  );
  await writeFile(resolve("dist/index.html"), html);
}
await writeFile(resolve("dist/404.html"), html);
await writeFile(resolve("dist/_redirects"), "/* /index.html 200\n");
console.log(`Entradas estáticas geradas para ${projects.length} projetos.`);
