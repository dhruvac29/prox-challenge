import { readFile, writeFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const files = ["owner-manual.pdf", "quick-start-guide.pdf", "selection-chart.pdf"];

for (const file of files) {
  const parser = new PDFParse({ data: await readFile(`files/${file}`) });
  const result = await parser.getText();
  await parser.destroy();
  await writeFile(`lib/knowledge/${file}.txt`, result.text);
  console.log(`${file}: ${result.total} pages, ${result.text.length} characters`);
}
