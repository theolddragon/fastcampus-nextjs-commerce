import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, categories, products } from '@prisma/client'

const prisma = new PrismaClient()

async function getCategories() {
  try {
    const response = await prisma.categories.findMany({})

    console.log(response)
    return response
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  items?: categories[]
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const products = await getCategories()
    res.status(200).json({ items: products, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
