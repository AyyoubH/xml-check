import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as libxml from 'libxmljs2';

function readFile(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  return fs.readFileSync(resolved, 'utf-8');
}

function loadSchemas(xsdPaths: string[]): libxml.Document[] {
  return xsdPaths.map((xsdPath) => {
    const content = readFile(xsdPath);
    return libxml.parseXml(content);
  });
}

function validateXml(xmlPath: string, schemas: libxml.Document[]): void {
  const xmlContent = readFile(xmlPath);
  const xmlDoc = libxml.parseXml(xmlContent);

  let valid = true;
  const allErrors: string[] = [];

  for (const schema of schemas) {
    const schemaValid = xmlDoc.validate(schema);
    if (!schemaValid) {
      valid = false;
      const errors = xmlDoc.validationErrors.map(
        (e) => `  Line ${e.line}: ${e.message.trim()}`
      );
      allErrors.push(...errors);
    }
  }

  if (valid) {
    console.log('\n✅ XML is valid against all provided schema(s).');
  } else {
    console.log('\n❌ XML is NOT valid. Validation errors:');
    allErrors.forEach((err) => console.log(err));
  }
}

async function promptXmlPath(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter the path to the XML file to validate: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage: npm start -- <schema1.xsd> [schema2.xsd ...]\n' +
      '    or: node dist/index.js <schema1.xsd> [schema2.xsd ...]'
    );
    process.exit(1);
  }

  console.log(`Loading ${args.length} schema file(s)...`);
  let schemas: libxml.Document[];
  try {
    schemas = loadSchemas(args);
    console.log('Schema(s) loaded successfully.');
  } catch (err) {
    console.error(`Error loading schema: ${(err as Error).message}`);
    process.exit(1);
  }

  const xmlPath = await promptXmlPath();

  try {
    validateXml(xmlPath, schemas);
  } catch (err) {
    console.error(`Error validating XML: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
