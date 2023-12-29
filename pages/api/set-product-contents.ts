import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function putProductContents(id: number, contents: string) {
  try {
    const response = await prisma.products.update({
      where: {
        id: id,
      },
      data: {
        contents: contents,
      },
    })

    console.log(response)
    return response
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  item?: any
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { id, contents } = JSON.parse(req.body)
  if (id == null || contents == null) {
    res.status(400).json({ message: `No id or contents` })
    return
  }

  try {
    const product = await putProductContents(Number(id), String(contents))
    res.status(200).json({ item: product, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
