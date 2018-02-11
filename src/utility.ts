import Gender from '@enum-all/gender'
import { get_gender } from '@wiki-analyzer/gender'
import axios from 'axios'
import baidu_baike_link from 'baidu-baike-link'
import baidu_baike_parser from 'baidu-baike-parser'
import { Option } from 'funfix-core'
import * as _ from 'lodash'

async function get_html(url: string): Promise<string> {
    const { data } = await axios.get(url)
    return data
}

async function get_gender_from_link(link: string): Promise<{ link: string, gender__opt: Option<Gender> }> {
    const html__str = await get_html(link)
    const source = baidu_baike_parser(html__str)
    const gender = await get_gender(source)
    return { link, gender__opt: gender }
}

export async function get_gender_from_name(name: string): Promise<Option<Gender>> {
    const links = await baidu_baike_link(name)
    const link_gender__list = await Promise.all(links.map(get_gender_from_link))
    const gender__list = link_gender__list.filter(lg => lg.gender__opt.nonEmpty()).map(lg => lg.gender__opt.get())
    if (_.isEmpty(gender__list)) {
        return Option.none()
    }
    if (_.every(gender__list, (a => a === Gender.male))) return Option.of(Gender.male)
    if (_.every(gender__list, (a => a === Gender.female))) return Option.of(Gender.female)
    return Option.none()
}
