import { MenuService } from '../../services/menu.service'

export default defineEventHandler(async (event) => {
  try {
    const name = getRouterParam(event, 'name')

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Menu name is required'
      })
    }

    const menu = await MenuService.getMenuByName(name)

    if (!menu) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu not found'
      })
    }

    return {
      success: true,
      data: menu
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch menu: ${error}`
    })
  }
})
