import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, products } from '@prisma/client'

const prisma = new PrismaClient()

async function getProductsCount(category: number) {
  const where =
    category && category !== -1
      ? {
          where: {
            id: category,
          },
        }
      : undefined
  try {
    const response = await prisma.products.count(where)

    console.log(response)
    return response
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  item?: number
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { category } = req.query

  try {
    const productCount = await getProductsCount(Number(category))
    res.status(200).json({ item: productCount, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
