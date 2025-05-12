<script setup lang="ts">
import { mockRegister } from '@/utils/fetchUtils.ts'
import { isStrongPassword, isValidEmail } from '@/utils/validations.ts'

const router = useRouter()

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const receiveUpdates = ref(false);
const emailError = ref<string|undefined>();
const passwordError = ref<string|undefined>();
const firstValidation = ref(false);
const isSubmitting = ref(false)
const serverError = ref('')

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'The password is required'
    return false
  }
  if (!isStrongPassword(password.value)) {
    passwordError.value = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    return false
  }
  passwordError.value = undefined
  return true
}

const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'The email is required'
    return false
  }
  if (!isValidEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  emailError.value = undefined
  return true
}

const validateForm = () => {
  if (!firstValidation.value) firstValidation.value = true
  const emailValid = validateEmail()
  const passwordValid = validatePassword()
  return emailValid && passwordValid
}

const submitRegister = async () => {
  const isValidated = validateForm()
  if (!isValidated) return

  isSubmitting.value = true
  serverError.value = ''

  try {
    // Since fetch isn't implemented yet, we can mock it to maintain the related code to its response.
    const response = await mockRegister({
      email: email.value,
      password: password.value,
      receiveUpdates: receiveUpdates.value,
    })
    
    if (response.status === 201) {
      router.push('/success')
    } else if (response.status === 409) {
      serverError.value = 'This email is already registered.'
    } else {
      serverError.value = 'Something went wrong. Please try again later.'
    }
  } catch (error) {
    serverError.value = 'Unable to connect. Please check your internet connection and try again.'
  } finally {
    isSubmitting.value = false
  }
}

// After the first validation, always check if there are errors
// I thought about including a debouncer, but for this light example of validation, I think we don't need it.
watch(email, () => {
  if (firstValidation.value) validateEmail()
})

watch(password, () => {
  if (firstValidation.value) validatePassword()
})
</script>

<template>
  <div class="screen">
    <provet-stack style="max-width: 340px;">
      <provet-banner v-if="serverError" shadow variant="danger">
        {{ serverError }}
      </provet-banner>
      <provet-card padding="l">
        <h2>Sign up Nord</h2>
        <form @submit.prevent="submitRegister">
          <provet-stack>
            <provet-input
              v-model="email"
              label="Email"
              expand
              required
              hide-required
              name="email"
              type="email"
              placeholder="user@example.com"
              :error="emailError"
            />

            <provet-input
              v-model="password"
              label="Password"
              expand
              required
              hide-required
              name="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :error="passwordError"
            >
              <provet-button slot="end" aria-describedby="password-tooltip" square type="button" @click="showPassword = !showPassword">
                <provet-icon name="interface-edit-on"></provet-icon>
                <provet-icon name="interface-edit-off"></provet-icon>
              </provet-button>
            </provet-input>
            <provet-tooltip id="password-tooltip">Show / hide password</provet-tooltip>

            <provet-checkbox 
              v-model="receiveUpdates" 
              label="Receive occasional product updates and announcements."
            />
            <provet-button type="submit" expand variant="primary" :loading="isSubmitting">
              Sign up
            </provet-button>
          </provet-stack>
        </form>
      </provet-card>
    </provet-stack>
  </div>
</template>

<style lang="css">
.screen {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

[type="password"] provet-icon[name="interface-edit-off"],
[type="text"] provet-icon[name="interface-edit-on"] {
  display: none;
}
</style>