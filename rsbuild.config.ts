import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'
import I18nRefresh from './plugins/i18n-refresh';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  
  tools: {
    htmlPlugin: {
      title: 'React template'
    },
    rspack: {
      plugins: [TanStackRouterRspack(), new I18nRefresh({})],
    },
  },
});
