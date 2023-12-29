import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, products } from '@prisma/client'

const prisma = new PrismaClient()

async function getProductsCount(category: number, contains: string) {
  const containsCondition =
    contains && contains !== ''
      ? {
          name: { contains: contains },
        }
      : undefined

  const where =
    category && category !== -1
      ? {
          category_id: category,
          ...containsCondition,
        }
      : containsCondition
        ? containsCondition
        : undefined

  try {
    const response = await prisma.products.count({ where: where })

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
  const { category, contains } = req.query

  try {
    const productCount = await getProductsCount(
      Number(category),
      String(contains),
    )
    res.status(200).json({ item: productCount, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
