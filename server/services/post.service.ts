// server/services/post.service.ts
import prismaCms from '../utils/prismaCms'
import { toPublicUser } from '~~/shared/models/user'
import { badRequestError, serverError, notFoundError, forbiddenError } from '../utils/errors'
import { ERROR_CODES } from '../constants/errors'
import { PRISMA_ERRORS } from '../constants/prisma'

// Types
interface CreatePostData {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  authorId: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

interface UpdatePostData {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  featuredImage?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

interface PostWithAuthor {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  status: string
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    login: string
    email: string
    displayName: string
  }
}

const prisma = prismaCms

/**
 * Post Service - Pure business logic without validation
 * Validation is handled in the API endpoints
 */

/**
 * Create a new post
 */
export async function createPost(
  postData: CreatePostData,
  authorId: string
): Promise<PostWithAuthor> {
  try {
    const article = await prismaCms.article.create({
      data: {
        title: postData.title,
        content: postData.content,
        authorId
      },
      include: {
        author: true
      }
    })

    return {
      ...article,
      author: toPublicUser(article.authorId),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }
  } catch (error: any) {
    if (error.code === PRISMA_ERRORS.FOREIGN_KEY_CONSTRAINT_FAILED) {
      throw badRequestError(ERROR_CODES.VALIDATION.INVALID_INPUT, 'Invalid author ID')
    }
    throw serverError(ERROR_CODES.SERVER.DATABASE_ERROR, 'Failed to create post')
  }
}

/**
 * Get all posts
 */
export async function getAllPosts(): Promise<PostWithAuthor[]> {
  try {
    const articles = await prismaCms.article.findMany({
      include: {
        author: true,
        translations: {
          where: { lang: 'de' }, // Default language
          take: 1
        },
        metas: {
          where: { key: 'featured_image' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Process articles with featured images
    const processedArticles = articles.map((article) => {
      const translation = article.translations[0] || {}
      const featuredImageMeta = article.metas?.find((m) => m.key === 'featured_image')

      // Extract featured image URL from JSON value
      let featuredImage = null
      if (featuredImageMeta?.value) {
        // value is JSON, extract the image path
        try {
          const value = typeof featuredImageMeta.value === 'string'
            ? JSON.parse(featuredImageMeta.value)
            : featuredImageMeta.value
          featuredImage = value?.filePath || value?.url || value || null
        } catch {
          // If not JSON, treat as string
          featuredImage = String(featuredImageMeta.value)
        }
      }

      return {
        id: article.id.toString(),
        title: translation.title || article.title || 'Untitled',
        slug: article.slug,
        content: translation.content || article.content || '',
        excerpt: translation.excerpt || article.excerpt || null,
        featuredImage,
        status: article.status,
        publishedAt: article.status === 'PUBLISHED' ? article.createdAt : null,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: {
          id: article.author.id.toString(),
          login: article.author.login,
          email: article.author.email,
          displayName: article.author.displayName
        },
        translations: article.translations.map((t) => ({
          lang: t.lang,
          title: t.title,
          content: t.content,
          excerpt: t.excerpt
        }))
      }
    })

    return processedArticles
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch posts:', error.message)
    throw new Error('Failed to fetch posts from database')
  }
}

/**
 * Get post by ID
 */
export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true
    }
  })

  if (!post) {
    return null
  }

  return {
    ...post,
    author: toPublicUser(post.author),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString()
  }
}

/**
 * Get WordPress article by slug
 */
export async function getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  try {
    const article = await prismaCms.article.findFirst({
      where: { slug },
      include: {
        author: true,
        translations: {
          where: { lang: 'de' }, // Default language
          take: 1
        },
        metas: {
          where: { key: 'featured_image' }
        }
      }
    })

    if (!article) {
      return null
    }

    const translation = article.translations[0] || {}
    const mediaResolver = new MediaResolver(prismaCms)

    // Resolve featured image using MediaResolver
    const featuredImageData = article.metas?.[0]?.value
    const resolvedMedia = await mediaResolver.resolveFeaturedImage(featuredImageData as any)

    return {
      id: article.id.toString(),
      title: translation.title || article.title || 'Untitled',
      slug: article.slug,
      content: translation.content || article.content || '',
      excerpt: translation.excerpt || article.excerpt || null,
      featuredImage: resolvedMedia?.sizes?.original || null,
      status: article.status,
      publishedAt: article.status === 'PUBLISHED' ? article.createdAt : null,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: {
        id: article.author.id.toString(),
        login: article.author.login,
        email: article.author.email,
        displayName: article.author.displayName
      },
      translations: article.translations.map((t) => ({
        lang: t.lang,
        title: t.title,
        content: t.content,
        excerpt: t.excerpt
      }))
    }
  } catch {
    return null
  }
}

/**
 * Update post if user owns it
 */
export async function updatePost(
  id: string,
  postData: UpdatePostData,
  authorId: string
): Promise<PostWithAuthor> {
  // Check if post exists and user owns it
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true }
  })

  if (!existingPost) {
    throw notFoundError(ERROR_CODES.RESOURCE.NOT_FOUND, 'Post not found')
  }

  if (existingPost.authorId !== authorId) {
    throw forbiddenError(
      ERROR_CODES.RESOURCE.INSUFFICIENT_PERMISSIONS,
      'You can only edit your own posts'
    )
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data: postData,
      include: {
        author: true
      }
    })

    return {
      ...post,
      author: toPublicUser(post.author),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }
  } catch (error: any) {
    if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND) {
      throw notFoundError(ERROR_CODES.RESOURCE.NOT_FOUND, 'Post not found')
    }
    throw serverError(ERROR_CODES.SERVER.DATABASE_ERROR, 'Failed to update post')
  }
}

/**
 * Delete post if user owns it
 */
export async function deletePost(id: string, authorId: string): Promise<void> {
  // Check if post exists and user owns it
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true }
  })

  if (!existingPost) {
    throw notFoundError(ERROR_CODES.RESOURCE.NOT_FOUND, 'Post not found')
  }

  if (existingPost.authorId !== authorId) {
    throw forbiddenError(
      ERROR_CODES.RESOURCE.INSUFFICIENT_PERMISSIONS,
      'You can only delete your own posts'
    )
  }

  try {
    await prisma.post.delete({
      where: { id }
    })
  } catch (error: any) {
    if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND) {
      throw notFoundError(ERROR_CODES.RESOURCE.NOT_FOUND, 'Post not found')
    }
    throw serverError(ERROR_CODES.SERVER.DATABASE_ERROR, 'Failed to delete post')
  }
}
