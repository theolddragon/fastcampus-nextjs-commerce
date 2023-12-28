import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'secret_uj5GOlYKv1nqTLPxw98az1fqfud9zzTdFBTwu9PbE7D',
})

const databaseId = 'f471ce80cb234009a5a11c72eb1b72ff'

async function addItem(name: string) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: [
          {
            text: {
              content: name,
            },
          },
        ],
      },
    })

    console.log(response)
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { name } = req.query
  if (name == null) {
    return res.status(400).json({ message: 'No name.' })
  }

  try {
    await addItem(String(name))
    res.status(200).json({ message: `Success ${name} added` })
  } catch (error) {
    res.status(500).json({ message: `Failed ${name} added` })
  }
}
