import { validateXML } from 'xmllint-wasm';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

function setStatus(message: string, type: 'idle' | 'loading' | 'success' | 'error') {
  const el = document.getElementById('status')!;
  el.textContent = message;
  el.className = `status ${type}`;
}

function renderErrors(errors: string[]) {
  const container = document.getElementById('errors')!;
  container.innerHTML = '';
  errors.forEach((err) => {
    const li = document.createElement('li');
    li.textContent = err;
    container.appendChild(li);
  });
}

async function handleValidate() {
  const xmlInput = document.getElementById('xml-file') as HTMLInputElement;
  const xsdInput = document.getElementById('xsd-files') as HTMLInputElement;

  if (!xmlInput.files || xmlInput.files.length === 0) {
    setStatus('Please select an XML file.', 'error');
    return;
  }

  setStatus('Validating…', 'loading');
  renderErrors([]);

  try {
    const xmlContent = await readFileAsText(xmlInput.files[0]);

    const schemaContents: string[] = [];
    if (xsdInput.files && xsdInput.files.length > 0) {
      for (const file of Array.from(xsdInput.files)) {
        schemaContents.push(await readFileAsText(file));
      }
    }

    const result = await validateXML(
      schemaContents.length > 0
        ? {
            xml: [{ fileName: xmlInput.files[0].name, contents: xmlContent }],
            schema: schemaContents,
          }
        : {
            xml: [{ fileName: xmlInput.files[0].name, contents: xmlContent }],
            normalization: 'format',
          }
    );

    if (result.valid) {
      setStatus('✅ XML is valid against all provided schema(s).', 'success');
    } else {
      const errors = result.errors.map((e) => e.message.trim());
      setStatus(`❌ XML is NOT valid. ${errors.length} error(s) found:`, 'error');
      renderErrors(errors);
    }
  } catch (err) {
    setStatus(`Error: ${(err as Error).message}`, 'error');
  }
}

document.getElementById('validate-btn')!.addEventListener('click', handleValidate);
