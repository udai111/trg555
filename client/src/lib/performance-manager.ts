import * as tf from '@tensorflow/tfjs';

export interface DeviceCapabilities {
  webglSupport: boolean;
  cpuCores: number;
  hasHighEndGPU: boolean;
  memoryLimit: number;
  performanceScore: number;
}

export interface PerformanceSettings {
  useHighPerformanceMode: boolean;
  enableBackgroundProcessing: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  updateInterval: number;
  maxParallelOperations: number;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private capabilities: DeviceCapabilities | null = null;
  private settings: PerformanceSettings = {
    useHighPerformanceMode: false,
    enableBackgroundProcessing: false,
    renderQuality: 'medium',
    updateInterval: 1000,
    maxParallelOperations: 2
  };

  private constructor() {}

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) return this.capabilities;

    const webglVersion = tf.ENV.get('WEBGL_VERSION');
    const webglSupport = !!webglVersion;

    // Detect CPU cores
    const cpuCores = navigator.hardwareConcurrency || 2;

    // Check for high-end GPU using WebGL parameters
    let hasHighEndGPU = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        hasHighEndGPU = /(nvidia|amd|radeon)/i.test(renderer);
      }
    } catch (e) {
      console.warn('GPU detection failed:', e);
    }

    // Estimate available memory (if possible)
    let memoryLimit = 4096; // Default assumption: 4GB
    if ('memory' in navigator) {
      const nav = navigator as any;
      if (nav.deviceMemory) {
        memoryLimit = nav.deviceMemory * 1024;
      }
    }

    // Calculate overall performance score
    const performanceScore = this.calculatePerformanceScore(
      webglSupport,
      cpuCores,
      hasHighEndGPU,
      memoryLimit
    );

    this.capabilities = {
      webglSupport,
      cpuCores,
      hasHighEndGPU,
      memoryLimit,
      performanceScore
    };

    return this.capabilities;
  }

  private calculatePerformanceScore(
    webglSupport: boolean,
    cpuCores: number,
    hasHighEndGPU: boolean,
    memoryLimit: number
  ): number {
    let score = 0;

    // WebGL support is critical
    if (webglSupport) score += 30;

    // CPU cores (up to 8 cores considered)
    score += Math.min(cpuCores, 8) * 5;

    // GPU capability
    if (hasHighEndGPU) score += 30;

    // Memory (up to 16GB considered)
    score += Math.min(memoryLimit / 1024, 16) * 2;

    return Math.min(score, 100);
  }

  updateSettings(newSettings: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  private applySettings() {
    if (this.settings.useHighPerformanceMode) {
      // Enable high-performance mode optimizations for WebGL
      try {
        tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
        tf.ENV.set('WEBGL_PACK', true);
      } catch (e) {
        console.warn('Failed to set WebGL optimizations:', e);
      }
    }

    // If we have the capabilities, configure based on them
    if (this.capabilities) {
      try {
        // Configure TensorFlow.js backend
        if (this.capabilities.webglSupport) {
          tf.setBackend('webgl');
        } else {
          tf.setBackend('cpu');
        }
      } catch (e) {
        console.warn('Failed to configure TensorFlow.js backend:', e);
      }
    }
  }

  getRecommendedSettings(): PerformanceSettings {
    if (!this.capabilities) return this.settings;

    const { performanceScore } = this.capabilities;

    return {
      useHighPerformanceMode: performanceScore > 70,
      enableBackgroundProcessing: performanceScore > 50,
      renderQuality: performanceScore > 80 ? 'high' : performanceScore > 40 ? 'medium' : 'low',
      updateInterval: performanceScore > 70 ? 500 : 1000,
      maxParallelOperations: Math.max(1, Math.floor(performanceScore / 25))
    };
  }

  getPerformanceWarnings(): string[] {
    const warnings: string[] = [];
    if (!this.capabilities) return warnings;

    const { webglSupport, cpuCores, memoryLimit, performanceScore } = this.capabilities;

    if (!webglSupport) {
      warnings.push('WebGL is not supported. ML features will run slower on CPU.');
    }

    if (cpuCores < 4) {
      warnings.push('Limited CPU cores detected. Performance may be affected.');
    }

    if (memoryLimit < 4096) {
      warnings.push('Limited memory detected. Large datasets may cause slowdowns.');
    }

    if (performanceScore < 40) {
      warnings.push('Your device may not be powerful enough for optimal performance.');
    }

    return warnings;
  }

  getCurrentSettings(): PerformanceSettings {
    return { ...this.settings };
  }
}

export const performanceManager = PerformanceManager.getInstance();