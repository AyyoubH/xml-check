# xml-check

A simple TypeScript CLI app that validates XML files against one or more XSD schemas.

## Prerequisites

- Node.js (v16+)
- npm

## Installation

```bash
npm install
```

## Usage

Run the app with one or more XSD schema files as arguments. The app will then prompt you for the path of the XML file to validate.

```bash
npx ts-node src/index.ts <schema1.xsd> [schema2.xsd ...]
```

### Example

```bash
npx ts-node src/index.ts schema.xsd
# Enter the path to the XML file to validate: data.xml
# ✅ XML is valid against all provided schema(s).
```

### Build & run compiled version

```bash
npm run build
node dist/index.js <schema1.xsd> [schema2.xsd ...]
```
