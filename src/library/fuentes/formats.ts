import type { FuentesTema } from "./tipos";

export const formats: FuentesTema = {
  version: "JSON · YAML 1.2 · TOML 1.0",
  entradas: {
    "JSON: objetos y arrays": ["https://www.json.org/json-en.html"],
    "YAML: claves y listas": ["https://yaml.org/spec/1.2.2/"],
    "Markdown básico": ["https://spec.commonmark.org/0.31.2/"],
    ".env": ["https://12factor.net/config"],
    "TOML": ["https://toml.io/en/v1.0.0", "TOML 1.0"],
    "YAML: textos multilínea y anclas": ["https://yaml.org/spec/1.2.2/"],
    "Dockerfile": ["https://docs.docker.com/reference/dockerfile/"],
    "docker-compose.yml": ["https://docs.docker.com/reference/compose-file/"],
    "GitHub Actions": ["https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax"],
    "JSON Schema": ["https://json-schema.org/understanding-json-schema/"],
    "jq": ["https://jqlang.org/manual/"],
    "CSV": ["https://www.rfc-editor.org/rfc/rfc4180"],
  },
};
