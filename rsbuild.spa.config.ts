import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import I18nRefresh from './plugins/i18n-refresh';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  source: {
    entry: {
      'main-spa': './src/index.tsx',
    },
  },
  output: {
    target: 'web',
    cleanDistPath: true,
  },
  
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },

  tools: {

    htmlPlugin: false,
    rspack: (config) => {
      // Add plugins
      config.plugins = [
        ...(config.plugins || []),
        TanStackRouterRspack(),
        new I18nRefresh({}),
      ];

      // Configure for SystemJS and single-spa
      if (config.output) {
        config.output.libraryTarget = 'system';
      }
      
      return config;
    },
  },
});
