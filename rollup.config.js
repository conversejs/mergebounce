import includePaths from 'rollup-plugin-includepaths';

const includePathOptions = {
    include: {},
    paths: ['node_modules'],
    external: [],
    extensions: ['.js']
};


export default {
  input: 'stashbounce.js',
  output: [
    {
      file: 'dist/stashbounce.js',
      format: 'iife',
      name: 'stashbounce',
    }
  ],
  plugins: [ includePaths(includePathOptions) ],
}
