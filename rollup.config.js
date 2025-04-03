import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'mergebounce.js',
  output: [
    {
      file: 'dist/mergebounce.js',
      format: 'iife',
      name: 'mergebounce',
    }
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js']
    }),
    babel({ 
      babelHelpers: 'bundled', 
      presets: ['@babel/preset-env'],
      exclude: 'node_modules/**'
    })
  ],
  external: []
}
