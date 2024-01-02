import { PrismaClient } from '@prisma/client'
import { jwtDecode } from 'jwt-decode'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

async function signUp(credential: string) {
  const decoded: { name: string; email: string; picture: string } =
    jwtDecode(credential)
  try {
    const response = await prisma.user.upsert({
      where: {
        email: decoded.email,
      },
      update: {
        name: decoded.name,
        image: decoded.picture,
      },
      create: {
        email: decoded.email,
        name: decoded.name,
        image: decoded.picture,
      },
    })
    console.log(decoded)
    return decoded
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
  const { credential } = req.query

  try {
    const token = await signUp(String(credential))
    res.status(200).json({ item: token, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
