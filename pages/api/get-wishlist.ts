import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession, unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getWishlist(userId: string) {
  try {
    const response = await prisma.wishlist.findUnique({
      where: {
        userId: userId,
      },
    })

    console.log(response)
    // productIds: '1,2,3'
    return response?.productIds.split(',')
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

export type GetWishlist = {
  items?: string[]
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetWishlist>,
) {
  const session = await getServerSession(req, res, authOptions)
  if (session == null) {
    res.status(200).json({ items: [], message: 'No Session' })
    return
  }

  try {
    const wishlist = await getWishlist(String(session?.id))
    res.status(200).json({ items: wishlist, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
