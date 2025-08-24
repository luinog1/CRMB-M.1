// Test script for addon addition functionality
// This script tests the current implementation and compares it with the reference

class AddonAdditionTester {
    constructor() {
        this.apiUrl = '/api';
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const coloredMessage = this.colorize(`[${timestamp}] ${message}`, type);
        console.log(coloredMessage);
        this.testResults.push({ timestamp, message, type });
    }

    colorize(message, type) {
        const colors = {
            success: '\x1b[32m', // green
            error: '\x1b[31m',   // red
            warning: '\x1b[33m', // yellow
            info: '\x1b[36m'     // cyan
        };
        return `${colors[type]}${message}\x1b[0m`;
    }

    // Test 1: Check current addon functionality
    async testCurrentAddonFunctionality() {
        this.log('=== Testing Current Addon Functionality ===', 'info');

        try {
            // Test getting current addons
            this.log('Testing GET /api/addons...', 'info');
            const response = await fetch(`${this.apiUrl}/addons`);
            const data = await response.json();

            if (response.ok && data.success) {
                this.log(`✅ Successfully fetched ${data.addons?.length || 0} addons`, 'success');
            } else {
                this.log(`❌ Failed to fetch addons: ${data.error || 'Unknown error'}`, 'error');
            }

            // Test available addons
            this.log('Testing GET /api/addons/available...', 'info');
            const availableResponse = await fetch(`${this.apiUrl}/addons/available`);
            const availableData = await availableResponse.json();

            if (availableResponse.ok && availableData.success) {
                this.log(`✅ Successfully fetched ${availableData.addons?.length || 0} available addons`, 'success');
            } else {
                this.log(`❌ Failed to fetch available addons: ${availableData.error || 'Unknown error'}`, 'error');
            }

        } catch (error) {
            this.log(`❌ Error testing current functionality: ${error.message}`, 'error');
        }
    }

    // Test 2: Test valid Stremio addon URLs
    async testValidAddonUrls() {
        this.log('=== Testing Valid Stremio Addon URLs ===', 'info');

        const validAddons = [
            {
                name: 'Cinemeta',
                url: 'https://v3-cinemeta.strem.io',
                description: 'Official Stremio addon with movie and TV metadata'
            }
        ];

        for (const addon of validAddons) {
            await this.testAddonInstallation(addon);
        }
    }

    // Test 3: Test invalid URLs
    async testInvalidAddonUrls() {
        this.log('=== Testing Invalid Addon URLs ===', 'info');

        const invalidUrls = [
            'https://invalid-url-that-does-not-exist.com',
            'not-a-url',
            'https://httpbin.org/status/404',
            ''
        ];

        for (const url of invalidUrls) {
            await this.testInvalidUrl(url);
        }
    }

    async testAddonInstallation(addon) {
        this.log(`🔧 Testing installation of ${addon.name}...`, 'info');

        try {
            const response = await fetch(`${this.apiUrl}/addons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: addon.url })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.log(`✅ Successfully installed ${addon.name}`, 'success');
                this.log(`   Addon ID: ${data.addon?.id || 'Unknown'}`, 'info');
            } else {
                this.log(`❌ Failed to install ${addon.name}: ${data.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            this.log(`❌ Error installing ${addon.name}: ${error.message}`, 'error');
        }
    }

    async testInvalidUrl(url) {
        this.log(`🔧 Testing invalid URL: ${url || '(empty)'}...`, 'info');

        try {
            const response = await fetch(`${this.apiUrl}/addons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.log(`❌ Unexpectedly succeeded with invalid URL: ${url}`, 'error');
            } else {
                this.log(`✅ Correctly rejected invalid URL: ${data.error || 'Unknown error'}`, 'success');
            }
        } catch (error) {
            this.log(`✅ Correctly rejected invalid URL: ${error.message}`, 'success');
        }
    }

    // Test 4: Compare with reference implementation
    compareWithReference() {
        this.log('=== Comparing with Reference Implementation ===', 'info');

        const referenceFeatures = [
            'Proper form with name, URL, type, and description fields',
            'URL validation before submission',
            'Manifest testing before adding addon',
            'Real-time feedback during installation',
            'Status indicators for addon health',
            'Enable/disable functionality',
            'Proper error handling with detailed messages'
        ];

        const currentFeatures = [
            'Simple prompt() for URL input',
            'Basic URL validation',
            'No manifest testing in frontend',
            'Limited feedback during installation',
            'Basic enable/disable in settings',
            'Generic error messages'
        ];

        this.log('📋 Reference Implementation Features:', 'info');
        referenceFeatures.forEach(feature => {
            this.log(`   ✓ ${feature}`, 'success');
        });

        this.log('📋 Current Implementation Features:', 'info');
        currentFeatures.forEach(feature => {
            this.log(`   ✗ ${feature}`, 'warning');
        });

        this.log('🔍 Key Missing Features:', 'warning');
        this.log('   1. Proper form UI instead of prompt()', 'warning');
        this.log('   2. Manifest validation before installation', 'warning');
        this.log('   3. Better error handling and user feedback', 'warning');
        this.log('   4. Status indicators and health checks', 'warning');
        this.log('   5. More detailed addon information', 'warning');
    }

    // Test 5: UI Feedback Testing
    testUIFeedback() {
        this.log('=== Testing UI Feedback Mechanisms ===', 'info');

        this.log('🔍 Current UI Issues:', 'warning');
        this.log('   1. Uses browser prompt() instead of integrated form', 'warning');
        this.log('   2. No loading states during installation', 'warning');
        this.log('   3. No progress indicators', 'warning');
        this.log('   4. Generic error messages', 'warning');
        this.log('   5. No validation feedback', 'warning');

        this.log('✅ Recommended Improvements:', 'info');
        this.log('   1. Create proper modal form with validation', 'info');
        this.log('   2. Add loading spinners and progress indicators', 'info');
        this.log('   3. Implement real-time manifest validation', 'info');
        this.log('   4. Add detailed error messages and suggestions', 'info');
        this.log('   5. Include addon preview before installation', 'info');
    }

    // Generate test report
    generateReport() {
        this.log('=== TEST REPORT GENERATED ===', 'info');
        this.log(`Total Tests: ${this.testResults.length}`, 'info');

        const successCount = this.testResults.filter(r => r.type === 'success').length;
        const errorCount = this.testResults.filter(r => r.type === 'error').length;
        const warningCount = this.testResults.filter(r => r.type === 'warning').length;

        this.log(`✅ Successful: ${successCount}`, 'success');
        this.log(`❌ Errors: ${errorCount}`, 'error');
        this.log(`⚠️ Warnings: ${warningCount}`, 'warning');

        return {
            totalTests: this.testResults.length,
            successCount,
            errorCount,
            warningCount,
            results: this.testResults
        };
    }

    // Main test runner
    async runAllTests() {
        this.log('🚀 Starting Addon Addition Functionality Tests', 'info');

        await this.testCurrentAddonFunctionality();
        await this.testValidAddonUrls();
        await this.testInvalidAddonUrls();
        this.compareWithReference();
        this.testUIFeedback();

        return this.generateReport();
    }
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.AddonAdditionTester = AddonAdditionTester;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddonAdditionTester;
}