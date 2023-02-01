import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  // test commit - 1
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})