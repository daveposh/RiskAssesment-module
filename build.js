const { execSync } = require('child_process');
const fs = require('fs');

// Run tests with coverage
console.log('Running tests...');
execSync('npm test -- --coverage', { stdio: 'inherit' });

// Display coverage summary
const coverageSummary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
console.log('\nCoverage Summary:');
console.log(`Statements: ${coverageSummary.total.statements.pct}%`);
console.log(`Branches: ${coverageSummary.total.branches.pct}%`);
console.log(`Functions: ${coverageSummary.total.functions.pct}%`);
console.log(`Lines: ${coverageSummary.total.lines.pct}%`);

// Check if we meet the coverage thresholds
const thresholds = {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80
};

const passes = 
  coverageSummary.total.statements.pct >= thresholds.statements &&
  coverageSummary.total.branches.pct >= thresholds.branches &&
  coverageSummary.total.functions.pct >= thresholds.functions &&
  coverageSummary.total.lines.pct >= thresholds.lines;

if (!passes) {
  console.error('\nCode coverage thresholds not met!');
  process.exit(1);
}

// Pack the app using FDK but bypass coverage check
console.log('\nBuilding app...');
try {
  execSync('fdk pack --skip-coverage', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 