import Gender from '@enum-all/gender'
import * as fs from 'fs'
import * as _ from 'lodash'
import { who } from 'xtranslation'

import { get_gender_from_name } from './utility'
// tslint:disable-next-line:variable-name
const Koa = require('koa')
const app = new Koa()
const koaBody = require('koa-body')
const cors = require('koa-cors')

function convert(gender: Gender): string {
    if (gender === Gender.male) return '男'
    else return '女'
}

async function get_gender_from_person(person: { name: string, org: string, job: string }): Promise<{ name: string, org: string, job: string, gender: string }> {
    const { name, org, job } = person
    const gender = (await get_gender_from_name(name)).map(convert).getOrElse('N/A')
    return { name, gender, org, job }
}

app.use(koaBody())
app.use(cors())

// tslint:disable-next-line:no-any
app.use(async (ctx: any) => {
    const person__list = (await who({ para: decodeURIComponent(ctx.request.body.UserInput) })).map(p => ({ name: p.name, org: p.org.getOrElse('N/A'), job: p.job.getOrElse('N/A') }))
    const person_with_gender__list = await Promise.all(person__list.map(get_gender_from_person))
    ctx.body = {person_with_gender__list}
})

app.listen(1234)
