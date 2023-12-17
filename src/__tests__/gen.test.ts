import { getSampleDMMF } from './__fixtures__/getSampleDMMF'
import { generate } from '../helpers/generate'

test('generate', async () => {
  const sampleDMMF = await getSampleDMMF()
  expect(generate(sampleDMMF.datamodel)).toMatchSnapshot("test_snapshot")
})
