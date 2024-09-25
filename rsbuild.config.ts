import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'
import IntlRefresh from './plugins/intl-refresh';

export default defineConfig({
  plugins: [pluginReact()],
  
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack(), new IntlRefresh({})],
    },
  },
});
