import Carousel from 'nuka-carousel'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import CustomEditor from '@components/Editor'
import { useRouter } from 'next/router'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'

const images = [
  {
    original: 'https://picsum.photos/id/1018/1000/600/',
    thumbnail: 'https://picsum.photos/id/1018/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1015/1000/600/',
    thumbnail: 'https://picsum.photos/id/1015/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1019/1000/600/',
    thumbnail: 'https://picsum.photos/id/1019/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1016/1000/600/',
    thumbnail: 'https://picsum.photos/id/1016/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1013/1000/600/',
    thumbnail: 'https://picsum.photos/id/1013/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1012/1000/600/',
    thumbnail: 'https://picsum.photos/id/1012/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1011/1000/600/',
    thumbnail: 'https://picsum.photos/id/1011/250/150/',
  },
]

export default function ProductsCarousel() {
  const [selectImageIndex, setSelectImageIndex] = useState(0)

  const router = useRouter()
  const { id: productId } = router.query
  const [editorState, setEditorState] = useState<EditorState | undefined>(
    undefined,
  )

  useEffect(() => {
    if (productId != null) {
      fetch(`/api/get-product?id=${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.item && data.item.contents) {
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(JSON.parse(data.item.contents)),
              ),
            )
          } else {
            setEditorState(EditorState.createEmpty())
          }
        })
    }
  }, [productId])

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/set-product-contents`, {
        method: 'POST',
        body: JSON.stringify({
          id: productId,
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent()),
          ),
        }),
      })
        .then((res) => res.json())
        .then((data) => alert(data.message))
    }
  }

  return (
    <>
      <Carousel
        animation="fade"
        withoutControls
        wrapAround
        slideIndex={selectImageIndex}
      >
        {images.map((image) => (
          <Image
            key={image.original}
            src={image.original}
            alt="image"
            width={1000}
            height={600}
            layout="responsive"
          />
        ))}
      </Carousel>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          gap: '5px',
        }}
      >
        {images.map((item, idx) => (
          <div key={idx} onClick={() => setSelectImageIndex(idx)}>
            <Image src={item.original} alt="image" width={100} height={60} />
          </div>
        ))}
      </div>
      {editorState != null && (
        <CustomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={handleSave}
        />
      )}
    </>
  )
}
