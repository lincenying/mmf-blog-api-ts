import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.ts'],
        fileParallelism: false,
        testTimeout: 15000,
        env: {
            NODE_ENV: 'test',
        },
        server: {
            deps: {
                inline: ['@lincy/markdown-it-toc-and-anchor', 'markdown-it', 'highlight.js'],
            },
        },
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
})
