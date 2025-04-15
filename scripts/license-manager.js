const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class NovaLicenseManager {
  constructor() {
    this.licenseHeader = `/*! @nova-license v2.1.0 | Commercial Use Restricted */\n`;
    this.proprietaryFiles = [
      'src/AiSuperFoodPaste.js',
      'src/QuantumHealthyElementJewelry.js',
      'src/finance/trading_system.py'
    ];
  }

  enforceLicenses() {
    this.proprietaryFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('@nova-license')) {
          fs.writeFileSync(filePath, this.licenseHeader + content);
          this.generateChecksum(filePath);
        }
      }
    });
  }

  generateChecksum(filePath) {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filePath);
    hash.update(data);
    fs.appendFileSync(path.join(__dirname, '../LICENSE.md'), 
      `\nChecksum: ${filePath}: ${hash.digest('hex')}`);
  }
}

module.exports = NovaLicenseManager;

// Run if executed directly
if (require.main === module) {
  new NovaLicenseManager().enforceLicenses();
}
