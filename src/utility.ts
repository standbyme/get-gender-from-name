import Gender from '@enum-all/gender'
import { get_gender } from '@wiki-analyzer/gender'
import axios from 'axios'
import baidu_baike_link from 'baidu-baike-link'
import baidu_baike_parser from 'baidu-baike-parser'
import { Option } from 'funfix-core'
import * as _ from 'lodash'

// tslint:disable-next-line:no-any
axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err: any) {
    const config = err.config
    // If config does not exist or the retry option is not set, reject
    if (!config || !config.retry) return Promise.reject(err)

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0

    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
        // Reject with the error
        return Promise.reject(err)
    }

    // Increase the retry count
    config.__retryCount += 1

    // Create new promise to handle exponential backoff
    // tslint:disable-next-line:no-any
    const backoff = new Promise(function (resolve: any) {
        setTimeout(function () {
            resolve()
        }, config.retryDelay || 1)
    })

    // Return the promise in which recalls axios to retry the request
    return backoff.then(function () {
        return axios(config)
    })
})

async function get_html(url: string): Promise<string> {
    // @ts-ignore
    const { data } = await axios.get(url, { retry: 3, retryDelay: 3000 })
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
