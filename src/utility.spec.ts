import Gender from '@enum-all/gender'
import * as assert from 'assert'

import { get_gender_from_name } from './utility'

describe('Get Gender from Name', function () {
    this.slow(5000)
    this.timeout(100000)

    it('Return Some if it OK', async function () {
        const result = await get_gender_from_name('李克强')
        assert.equal(result.get(), Gender.male)
    })

    // it('Return Some if it OK', async function () {
    //     const result = await get_gender_from_name('王毅')
    //     assert.equal(result.get(), Gender.male)
    // })

    it('Return Some if it OK', async function () {
        const result = await get_gender_from_name('董明珠')
        assert.equal(result.get(), Gender.female)
    })

    it('Return None if it fails', async function () {
        const result = await get_gender_from_name('刘涛')
        assert(result.isEmpty())
    })
})
