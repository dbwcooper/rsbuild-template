import fs from 'node:fs/promises'
import path from 'node:path'
import type { Compiler as RspackCompiler, RspackPluginInstance } from '@rspack/core'
import { sync as globSync } from 'fast-glob'
import { compileAndWrite, CompileCLIOpts, extractAndWrite, ExtractCLIOptions } from '@formatjs/cli-lib'
const PLUGIN_NAME = 'I18nRefresh'

export interface I18nRefreshProps {
  /**
   * Locales to support for translation.
   * @default ['zh-CN']
   */
  supportedLocales?: string[];

  /**
   * Base locale for internationalization.
   * @default 'en-US'
   */
  defaultLocale?: string;

  /**
   * Glob pattern for source files to process.
   * @default 'src/***.{ts,tsx}'
   */
  sourcePattern?: string;

  /**
   * Output directory for generated locale files.
   * @default './src/assets/i18n'
   */
  outputDir?: string;

  /**
   * Files to watch for changes. When these files change, the plugin will
   * re-run to regenerate the extracted messages.
   * @default ['messages.tsx', 'message.tsx', 'messages.ts', 'message.ts']
   */
  watchPatterns?: string[];
}



/**
 * I18nManager plugin class.
 */
class I18nManager implements RspackPluginInstance {
  /**
   * Plugin name.
   */
  name = PLUGIN_NAME

  /**
   * Base locale for internationalization.
   */
  defaultLocale: string = 'en-US'

  /**
   * List of supported supportedLocales .
   */
  supportedLocales: string[] = []

  /**
   * Output directory for generated locale files (optional).
   */
  outputDir: string = './src/assets/i18n'

  watchPatterns: string[] = ['messages.tsx', 'message.tsx', 'messages.ts', 'message.ts']

  sourcePattern: string = 'src/**/*.{ts,tsx}'

  /**
   * Constructor for I18nRefresh plugin.
   * @param props - I18nRefresh plugin properties.
   */
  constructor(props: I18nRefreshProps) {
    this.defaultLocale = props.defaultLocale ?? 'en-US'
    this.supportedLocales = props.supportedLocales ?? ['zh-CN', 'en-US']
    this.outputDir = props.outputDir ?? './src/assets/i18n'
    this.watchPatterns = props.watchPatterns ?? ['messages.tsx', 'message.tsx', 'messages.ts', 'message.ts']
    this.sourcePattern = props.sourcePattern ?? 'src/**/*.{ts,tsx}'
  }

  /**
  * Apply the plugin to the Rspack compiler.
  *
  * Listens to the `watchRun` hook and checks if any of the watched files
  * (e.g. messages.tsx, message.tsx, messages.ts, message.ts) have changed.
  * If a change is detected, calls the `buildBaseJson` method to regenerate
  * the base locale JSON file.
  * @param compiler - Rspack compiler instance.
  */
  apply(compiler: RspackCompiler) {
    compiler.hooks.watchRun.tap(PLUGIN_NAME, (compiler) => {
      const changedFiels = Array.from(compiler.modifiedFiles || [])
      const isMessageChanged = changedFiels.some((file) => this.watchPatterns.some(w => file.endsWith(w)))
      if (isMessageChanged) {
        this.buildBaseJson()
      }
    })


  }


  async buildBaseJson() {
    const files = globSync(this.sourcePattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
    })

    const tempFile = './dist/i18n-default.json'
    const outputJsonFile = path.join(this.outputDir, `${this.defaultLocale}.json`)

    const extractOpts: ExtractCLIOptions = {
      flatten: true,
      throws: true,
      idInterpolationPattern: '[sha1:contenthash:8]',
      preserveWhitespace: true,
      outFile: tempFile,
    }
    const compileOpts: CompileCLIOpts = {
      outFile: outputJsonFile,
      skipErrors: false
    }

    try {

      await extractAndWrite(files, extractOpts)
      await compileAndWrite([tempFile], compileOpts)
      await fs.appendFile(outputJsonFile, '\n')

      const restLocales = this.supportedLocales.filter((locale) => locale !== this.defaultLocale)
      await this.buildLocalesJson(outputJsonFile, restLocales)

    } catch (error) {
      console.error(error)
    }

  }

  /**
   * Builds JSON files for the given locales by merging the base JSON data with any existing locale data.
   *
   * @param {string} baseFilePath - The file path of the base JSON data.
   * @param {string[]} locales - An array of locale codes for which to generate JSON files.
   *
   * @return {Promise<void>} A promise that resolves when all locale JSON files have been written.
   */
  async buildLocalesJson(baseFilePath: string, locales: string[]): Promise<void> {

    const baseJsonData: Record<string, string> = JSON.parse((await fs.readFile(baseFilePath, 'utf8')))

    for (const locale of locales) {
      const nextLocaleFilePath = path.join(this.outputDir, `${locale}.json`);
      try {
        await this.generateLocaleJson(baseJsonData, nextLocaleFilePath);
        console.log(`${PLUGIN_NAME}: Locale ${locale} generated successfully`);
      } catch (error) {
        console.error(`${PLUGIN_NAME}: Error generating locale ${locale}:`, error);
      }
    }
  }

  /**
   * Generates a JSON file for a specific locale by merging the base JSON data with any existing locale data.
   *
   * @param {Record<string, string>} baseJsonData - The base JSON data to be used for the locale.
   * @param {string} nextLocaleFilePath - The file path where the generated locale JSON will be written.
   *
   * @return {Promise<void>} A promise that resolves when the locale JSON file has been written.
   */
  async generateLocaleJson(baseJsonData: Record<string, string>, nextLocaleFilePath: string): Promise<void> {

    const targetJsonData: Record<string, string> = {}
    let prevTargetJsonData: Record<string, string> = {}

    try {
      await fs.access(nextLocaleFilePath)
      prevTargetJsonData = JSON.parse((await fs.readFile(nextLocaleFilePath, 'utf8')).toString())
    } catch (error) {
    }

    Object.keys(baseJsonData).forEach((key) => {
      if (prevTargetJsonData[key]) {
        targetJsonData[key] = prevTargetJsonData[key]
      } else {
        targetJsonData[key] = baseJsonData[key]
      }
    })

    const mergedJsonStr = `${JSON.stringify(targetJsonData, null, 2)}\n`
    await fs.writeFile(nextLocaleFilePath, mergedJsonStr)
  }
}

export default I18nManager