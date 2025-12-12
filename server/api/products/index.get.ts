// server/api/products/index.get.ts
import { getAllProducts } from '../../services/product.service'
import { createApiResponse } from '../../utils/response'
import { serverError } from '../../utils/errors'

export default defineEventHandler(async () => {
  try {
    const products = await getAllProducts()

    return createApiResponse(products, 200, 'Products erfolgreich abgerufen')
  } catch {
    throw serverError('INTERNAL_ERROR', 'Fehler beim Abrufen der Products')
  }
})
