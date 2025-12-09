import { MenuService } from '../../services/menu.service'

export default defineEventHandler(async (_event) => {
  try {
    const menus = await MenuService.getAllMenus()

    return {
      success: true,
      data: menus
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch menus: ${error}`
    })
  }
})
