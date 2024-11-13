const esprima = require("esprima");

const code = process.argv[2];

try {
  esprima.parseScript(code);
  console.log("Parsed OK");
} catch (error) {
  console.error("Failed to parse code: ", error);
  process.exit(1);
}
