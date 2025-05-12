import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import RegisterScreen from '@/pages/index.vue'
import { vi } from 'vitest'
import { describe } from 'vitest'
import { beforeEach, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const mockRouterPush = vi.fn();

mockNuxtImport('useRouter', () => {
    return () => ({
        push: mockRouterPush,
    });
});

vi.mock('@/utils/fetchUtils', () => ({
  mockRegister: vi.fn()
}))

describe('index.vue RegisterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows required error if email and password are empty on submit', async () => {
    const wrapper = mount(RegisterScreen)

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    const [emailInput, passInput] = wrapper.findAll('provet-input')

    expect(emailInput.element.error).toBe('The email is required')
    expect(passInput.element.error).toBe('The password is required')
  })

  it('shows email validation error if email is invalid', async () => {
    const wrapper = mount(RegisterScreen)

    const [emailInput, passInput] = wrapper.findAll('provet-input')
    emailInput.element.value = 'invalid-email'
    await emailInput.trigger('input')
    passInput.element.value = 'Str0ngPass!'
    await passInput.trigger('input')

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(emailInput.element.error).toBe('Please enter a valid email address')
  })

  it('shows password validation error if password is weak', async () => {
    const wrapper = mount(RegisterScreen)

    const [emailInput, passInput] = wrapper.findAll('provet-input')
    emailInput.element.value = 'test@example.com'
    await emailInput.trigger('input')
    passInput.element.value = '123'
    await passInput.trigger('input')

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(passInput.element.error).toContain('Password must be at least 8 characters')
  })

  it('submits and redirects on success', async () => {

    vi.mocked(mockRegister).mockResolvedValue({
      status: 201,
      message: 'User registered successfully'
    })

    const wrapper = mount(RegisterScreen)

    const [emailInput, passInput] = wrapper.findAll('provet-input')
    emailInput.element.value = 'test@example.com'
    await emailInput.trigger('input')
    passInput.element.value = 'Str0ngPass!'
    await passInput.trigger('input')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Str0ngPass!',
      receiveUpdates: false
    })
   
    expect(mockRouterPush).toHaveBeenCalledWith('/success')
  })

  it('shows server error on error response', async () => {
    vi.mocked(mockRegister).mockResolvedValue({ status: 400, message: 'server error' })

    const wrapper = mount(RegisterScreen)
    const [emailInput, passInput] = wrapper.findAll('provet-input')
    emailInput.element.value = 'test@example.com'
    await emailInput.trigger('input')
    passInput.element.value = 'Str0ngPass!'
    await passInput.trigger('input')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('provet-banner').element.textContent).toContain('Something went wrong. Please try again later.')
  })

  it('shows error on network failure', async () => {
    vi.mocked(mockRegister).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(RegisterScreen)
    const [emailInput, passInput] = wrapper.findAll('provet-input')
    emailInput.element.value = 'test@example.com'
    await emailInput.trigger('input')
    passInput.element.value = 'Str0ngPass!'
    await passInput.trigger('input')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('provet-banner').element.textContent).toBe('Unable to connect. Please check your internet connection and try again.')
  })

  it('shows error on repeated email', async () => {
    vi.mocked(mockRegister).mockResolvedValue({ status: 409, message: 'Email already registered' })

    const wrapper = mount(RegisterScreen)
    const [emailInput, passInput] = wrapper.findAll('provet-input')
    emailInput.element.value = 'repeated@email.com'
    await emailInput.trigger('input')
    passInput.element.value = 'Str0ngPass!'
    await passInput.trigger('input')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('provet-banner').element.textContent).toBe('This email is already registered.')
  })

  it('toggles password visibility when the show/hide button is clicked', async () => {
    const wrapper = mount(RegisterScreen)

    const [_emailInput, passInput] = wrapper.findAll('provet-input')

    const provetButton = wrapper.find('provet-input provet-button')
    expect(passInput.element.type).toBe('password')


    await provetButton.trigger('click')
    expect(passInput.element.type).toBe('text')
  })
})
