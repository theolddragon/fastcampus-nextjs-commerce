import { jwtDecode } from 'jwt-decode'
import type { NextApiRequest, NextApiResponse } from 'next'

async function getToken(credential: string) {
  const decoded = jwtDecode(credential)
  try {
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
    const token = await getToken(String(credential))
    res.status(200).json({ item: token, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
