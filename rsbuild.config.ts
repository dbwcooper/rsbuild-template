import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'
import I18nRefresh from './plugins/i18n-refresh';

export default defineConfig({
  plugins: [pluginReact()],
  
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack(), new I18nRefresh({})],
    },
  },
});
