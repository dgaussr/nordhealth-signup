interface HttpResponse {
    status: number
    message: string,
}

export const mockRegister = (data: { email: string; password: string; receiveUpdates: boolean }): Promise<HttpResponse> => {
    const alreadyRegisteredEmails = ['repeated@email.com']
    return new Promise((resolve) => {
        setTimeout(() => {
          if (alreadyRegisteredEmails.includes(data.email)) {
            resolve({
              status: 409,
              message: 'Email already registered',
            })
          } else {
            resolve({
              status: 201,
              message: 'User registered successfully',
            })
          }
        }, 1000)
      })
}