/**
 * NVIDIA Blackwell GPU Setup Script for NOVA BLOCKS Backend
 * Installs and configures Blackwell-specific drivers and optimizations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BlackwellSetup {
    constructor() {
        this.isWindows = process.platform === 'win32';
        this.isLinux = process.platform === 'linux';
        this.cudaVersion = '12.4';
        this.blackwellDrivers = '560.35';
    }

    async runSetup() {
        console.log('🚀 Starting NVIDIA Blackwell GPU Setup for NOVA BLOCKS...\n');

        try {
            await this.checkSystemRequirements();
            await this.installCuda();
            await this.installBlackwellDrivers();
            await this.configureTensorRT();
            await this.verifyInstallation();
            await this.createConfigFile();

            console.log('✅ Blackwell GPU setup completed successfully!');
            console.log('🎯 Your NOVA BLOCKS backend is now optimized for NVIDIA Blackwell GPUs');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async checkSystemRequirements() {
        console.log('1️⃣  Checking system requirements...');

        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`   Node.js version: ${nodeVersion}`);

        // Check OS
        console.log(`   Operating System: ${process.platform}`);

        // Check for existing NVIDIA GPU
        try {
            const nvidiaSmi = execSync('nvidia-smi --query-gpu=name --format=csv,noheader,nounits', { encoding: 'utf8' });
            const gpuName = nvidiaSmi.trim();
            console.log(`   GPU detected: ${gpuName}`);

            if (gpuName.includes('Blackwell')) {
                console.log('   ✅ Blackwell GPU confirmed');
            } else {
                console.log('   ⚠️  Non-Blackwell GPU detected - optimizations may be limited');
            }
        } catch (error) {
            console.log('   ❌ No NVIDIA GPU detected');
            throw new Error('NVIDIA GPU required for Blackwell setup');
        }
    }

    async installCuda() {
        console.log('\n2️⃣  Installing CUDA Toolkit...');

        if (this.isWindows) {
            console.log('   Downloading CUDA Toolkit 12.4 for Windows...');
            // Windows CUDA installation commands
            execSync('curl -o cuda.exe https://developer.download.nvidia.com/compute/cuda/12.4.0/local_installers/cuda_12.4.0_551.61_windows.exe', { stdio: 'inherit' });
            execSync('cuda.exe -s', { stdio: 'inherit' });
        } else if (this.isLinux) {
            console.log('   Installing CUDA Toolkit 12.4 for Linux...');
            execSync('wget https://developer.download.nvidia.com/compute/cuda/12.4.0/local_installers/cuda_12.4.0_550.54.14_linux.run', { stdio: 'inherit' });
            execSync('sudo sh cuda_12.4.0_550.54.14_linux.run --no-opengl-libs --no-man-page --no-doc --silent', { stdio: 'inherit' });
        }

        console.log('   ✅ CUDA Toolkit installed');
    }

    async installBlackwellDrivers() {
        console.log('\n3️⃣  Installing Blackwell-specific drivers...');

        if (this.isWindows) {
            console.log('   Installing NVIDIA drivers for Blackwell...');
            execSync('curl -o drivers.exe https://us.download.nvidia.com/Windows/560.35/560.35-desktop-win10-win11-64bit-international-dch-whql.exe', { stdio: 'inherit' });
            execSync('drivers.exe /s /noreboot', { stdio: 'inherit' });
        } else if (this.isLinux) {
            console.log('   Installing NVIDIA drivers for Blackwell...');
            execSync('sudo apt update', { stdio: 'inherit' });
            execSync('sudo apt install -y nvidia-driver-560', { stdio: 'inherit' });
        }

        console.log('   ✅ Blackwell drivers installed');
    }

    async configureTensorRT() {
        console.log('\n4️⃣  Configuring TensorRT for Blackwell...');

        // Install TensorRT
        if (this.isWindows) {
            execSync('pip install tensorrt==10.0.1 --extra-index-url https://pypi.nvidia.com', { stdio: 'inherit' });
        } else {
            execSync('pip3 install tensorrt==10.0.1 --extra-index-url https://pypi.nvidia.com', { stdio: 'inherit' });
        }

        console.log('   ✅ TensorRT configured');
    }

    async verifyInstallation() {
        console.log('\n5️⃣  Verifying installation...');

        // Test CUDA
        try {
            const cudaVersion = execSync('nvcc --version', { encoding: 'utf8' });
            console.log('   ✅ CUDA verified:', cudaVersion.split('\n')[3]);
        } catch (error) {
            throw new Error('CUDA verification failed');
        }

        // Test GPU
        try {
            const gpuTest = execSync('nvidia-smi', { encoding: 'utf8' });
            console.log('   ✅ GPU verified');
        } catch (error) {
            throw new Error('GPU verification failed');
        }

        // Test TensorRT
        try {
            execSync('python -c "import tensorrt as trt; print(\'TensorRT version:\', trt.__version__)"', { stdio: 'inherit' });
            console.log('   ✅ TensorRT verified');
        } catch (error) {
            console.log('   ⚠️  TensorRT verification failed - some features may be limited');
        }
    }

    async createConfigFile() {
        console.log('\n6️⃣  Creating configuration file...');

        const config = {
            blackwell: {
                enabled: true,
                cudaVersion: this.cudaVersion,
                driverVersion: this.blackwellDrivers,
                optimizations: {
                    mixedPrecision: true,
                    tensorCores: true,
                    sparsity: true,
                    parallelProcessing: true
                }
            },
            models: {
                finance: {
                    ai_training_module: 'nova-blocks/finance/models/options_ai_model.pth',
                    rl_trading_agent: 'nova-blocks/finance/models/rl_trading_agent.pth',
                    stock_market_trainer: 'nova-blocks/finance/models/stock_market_ai.h5'
                }
            }
        };

        const configPath = path.join(__dirname, '..', 'blackwell-config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        console.log(`   ✅ Configuration saved to ${configPath}`);
    }
}

// Run setup if called directly
if (require.main === module) {
    const setup = new BlackwellSetup();
    setup.runSetup();
}

module.exports = BlackwellSetup;
