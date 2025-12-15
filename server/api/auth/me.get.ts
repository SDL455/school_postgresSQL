import { getCurrentUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ'
    })
  }
  
  return {
    success: true,
    data: user
  }
})
