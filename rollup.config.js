import includePaths from 'rollup-plugin-includepaths';
import { babel } from '@rollup/plugin-babel';

const includePathOptions = {
    include: {},
    paths: ['node_modules'],
    external: [],
    extensions: ['.js']
};


export default {
  input: 'mergebounce.js',
  output: [
    {
      file: 'dist/mergebounce.js',
      format: 'iife',
      name: 'mergebounce',
    }
  ],
  plugins: [ includePaths(includePathOptions), babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] }) ],
}
