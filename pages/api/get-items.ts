import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'secret_uj5GOlYKv1nqTLPxw98az1fqfud9zzTdFBTwu9PbE7D',
})

const databaseId = 'f471ce80cb234009a5a11c72eb1b72ff'

async function getItems() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'price',
          direction: 'ascending',
        },
      ],
    })

    console.log(response)
    return response?.results
  } catch (error) {
    console.error(JSON.stringify(error))
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
  try {
    const response = await getItems()
    res.status(200).json({ items: response, message: 'Success' })
  } catch (error) {
    res.status(500).json({ message: `Failed` })
  }
}
