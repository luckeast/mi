import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,

    // Enable UnoCSS support
    // https://unocss.dev/integrations/vscode
    unocss: true,
    formatters: true,
  },
  {
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-exports': 'off',
    },
  },
  {
    ignores: [
      '.github/**',
      // 忽略图片文件
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.gif',
      '**/*.svg',
      '**/*.webp',
      '**/*.ico',
      // 忽略其他静态资源
      '**/*.mp4',
      '**/*.mp3',
      '**/*.mov',
      '**/*.wav',
      '**/*.woff',
      '**/*.woff2',
      '**/*.ttf',
      '**/*.eot',
    ],
  },
)
