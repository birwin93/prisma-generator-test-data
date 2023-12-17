import { DMMF, generatorHandler, GeneratorOptions } from '@prisma/generator-helper'
import path from 'path'
import { GENERATOR_NAME } from './constants'
import { writeFileSafely } from './utils/writeFileSafely'
import { generate } from './helpers/generate'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const content = generate(options.dmmf.datamodel);
    const writeLocation = path.join(
      options.generator.output?.value!,
      `test.data.ts`,
    )

    await writeFileSafely(writeLocation, content)
  },
})

