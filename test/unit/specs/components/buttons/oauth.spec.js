import BootstrapVue from 'bootstrap-vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons'
import 'vue-awesome/icons/facebook'
import 'vue-awesome/icons/google-plus'
import 'vue-awesome/icons/twitter'

import testLocalConfig from '@/test/test.local.config'
import { mount, createLocalVue } from '@vue/test-utils'
import OauthButtons from '@/components/buttons/Oauth'

describe('Oauth buttons', () => {
  let localVue = null
  let next = null
  let wrapper = null
  let propsData = null

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(BootstrapVue)
    localVue.component('icon', Icon)
    next = '/example'
    propsData = {
      facebook: true,
      google: true,
      twitter: true,
      next: next
    }
    wrapper = mount(OauthButtons, {
      localVue,
      propsData: propsData
    })
  })

  it('does not render disabled buttons', () => {
    const renderer = require('vue-server-renderer').createRenderer()
    wrapper.setProps({
      facebook: false,
      google: false,
      twitter: false
    })
    renderer.renderToString(wrapper.vm, (err, str) => {
      expect(str).toMatchSnapshot()
    })
  })

  it('renders all enabled buttons', () => {
    const renderer = require('vue-server-renderer').createRenderer()
    renderer.renderToString(wrapper.vm, (err, str) => {
      expect(str).toMatchSnapshot()
    })
  })

  it('redirects to the correct oauth endpoint', () => {
    const endpoint = 'twitter'
    const host = testLocalConfig.pybossaHost
    const expectedUrl = `${host}/${endpoint}?response_format=json`
    const mockAssign = jest.fn()
    window.location.assign = mockAssign
    wrapper.vm.redirect(endpoint)
    expect(mockAssign).toHaveBeenCalledWith(expectedUrl)
  })
})
