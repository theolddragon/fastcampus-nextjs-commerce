import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'secret_uj5GOlYKv1nqTLPxw98az1fqfud9zzTdFBTwu9PbE7D',
})

const databaseId = 'f471ce80cb234009a5a11c72eb1b72ff'

async function getDetail(id: string, propertyId: string) {
  try {
    const response = await notion.pages.properties.retrieve({
      page_id: id,
      property_id: propertyId,
    })

    console.log(response)
    return response
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  detail?: any
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { pageId, propertyId } = req.query
  if (pageId == null || pageId === '') {
    return res.status(400).json({ message: 'No id.' })
  }
  if (propertyId == null || propertyId === '') {
    return res.status(400).json({ message: 'No property id.' })
  }

  try {
    const response = await getDetail(String(pageId), String(propertyId))
    res.status(200).json({ detail: response, message: `Success get detail` })
  } catch (error) {
    res.status(500).json({ message: `Failed get detail` })
  }
}
