import * as tf from '@tensorflow/tfjs';

export interface PerformanceSettings {
  useHighPerformanceMode: boolean;
  enableBackgroundProcessing: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  updateInterval: number;
  maxParallelOperations: number;
  batchSize: number;
  useWebWorkers: boolean;
  enableMemoryOptimization: boolean;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private settings: PerformanceSettings = {
    useHighPerformanceMode: false,
    enableBackgroundProcessing: false,
    renderQuality: 'medium',
    updateInterval: 1000,
    maxParallelOperations: 2,
    batchSize: 32,
    useWebWorkers: true,
    enableMemoryOptimization: true
  };

  private constructor() {}

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  async updateSettings(newSettings: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.applySettings();
  }

  private async applySettings() {
    try {
      if (this.settings.useHighPerformanceMode) {
        try {
          await tf.setBackend('webgl');
          console.log('GPU mode enabled successfully');
        } catch (e) {
          console.warn('Failed to enable GPU mode, falling back to CPU:', e);
          await tf.setBackend('cpu');
        }
      } else {
        await tf.setBackend('cpu');
        console.log('CPU mode enabled');
      }
      await tf.ready();

      // Configure tensor operations
      tf.enableProdMode();
      if (this.settings.enableMemoryOptimization) {
        tf.setAutoGC(true);
        tf.tidy(() => {});
      }
    } catch (e) {
      console.warn('Failed to configure TensorFlow.js backend:', e);
      await tf.setBackend('cpu');
      await tf.ready();
    }
  }


  getCurrentSettings(): PerformanceSettings {
    return { ...this.settings };
  }
}

export const performanceManager = PerformanceManager.getInstance();