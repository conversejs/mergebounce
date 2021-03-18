import includePaths from 'rollup-plugin-includepaths';

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
  plugins: [ includePaths(includePathOptions) ],
}
