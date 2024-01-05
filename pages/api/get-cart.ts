import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getCart(userId: string) {
  try {
    const cart = await prisma.$queryRaw`
      SELECT c.id, 
             c."userId",  
             c.quantity, 
             c.amount, 
             p.price, 
             p.name, 
             p.image_url,
             p.id AS productId 
      FROM   "Cart" AS c
      INNER JOIN products AS p ON c."productId" = p.id
      WHERE   c."userId"=${userId};
    `

    console.log(cart)
    return cart
  } catch (error) {
    console.error(error)
  }
}

type Data = {
  items?: any
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const session = await getServerSession(req, res, authOptions)
  if (session == null) {
    res.status(200).json({ items: [], message: 'no Session' })
    return
  }

  try {
    const wishlist = await getCart(String(session?.id))
    res.status(200).json({ items: wishlist, message: 'Success' })
  } catch (error) {
    res.status(400).json({ message: 'Failed' })
  }
}
