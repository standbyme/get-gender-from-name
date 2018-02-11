import Gender from '@enum-all/gender'
import * as _ from 'lodash'
import { who } from 'xtranslation'

import { get_gender_from_name } from './utility'

const str = `
中国国务院侨办副主任谭天星12日在中国驻悉尼总领事馆副总领事童学军陪同下走到访悉尼华星艺术团。
悉尼华星艺术团团长余俊武介绍了刚刚结束的《文化中国•华星闪耀》的活动情况，
并表示自己在活动中深深感受到了海外华人华侨对中华文化的渴望而产生着巨大的能量，
而华星艺术团就是要把这些能量凝聚起来，在本土形成传承弘扬中华文化的强大实力。
`

function convert(gender: Gender): string {
    if (gender === Gender.male) return '男'
    else return '女'
}

async function main() {
    const person__list = (await who({ para: str }))
    console.log(person__list)
    const name__list = person__list.map(p => p.name)
    const person_with_gender_promise__list = name__list.map(get_gender_from_name)
    const gender__list = (await Promise.all(person_with_gender_promise__list)).map(g => g.map(convert).getOrElse('N/A'))
    console.log(_.zip(name__list, gender__list))
}

main()
