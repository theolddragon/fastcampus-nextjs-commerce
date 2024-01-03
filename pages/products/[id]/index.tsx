import Carousel from 'nuka-carousel'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Head from 'next/head'
import CustomEditor from '@components/Editor'
import { useRouter } from 'next/router'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { GetServerSidePropsContext } from 'next'
import { products } from '@prisma/client'
import { CATEGORY_MAP } from '@/constants/products'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@mantine/core'
import { IconHeart, IconHeartbeat } from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import { GetWishlist } from '@/pages/api/get-wishlist'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const product = await fetch(
    `http://localhost:3000/api/get-product?id=${context.params?.id}`,
  )
    .then((res) => res.json())
    .then((data) => data.item)
  return {
    props: {
      product: { ...product, images: [product?.image_url, product?.image_url] },
    },
  }
}

const WISHLIST_QUERY_KEY = `/api/get-wishlist`

export default function ProductsCarousel(props: {
  product: products & { images: string[] }
}) {
  const [selectImageIndex, setSelectImageIndex] = useState(0)
  const { data: session } = useSession()

  const router = useRouter()
  const { id: productId } = router.query
  const product = props.product

  const [editorState, setEditorState] = useState<EditorState | undefined>(() =>
    product?.contents
      ? EditorState.createWithContent(
          convertFromRaw(JSON.parse(product.contents)),
        )
      : EditorState.createEmpty(),
  )

  const { data: wishlist } = useQuery({
    queryKey: [WISHLIST_QUERY_KEY],
    queryFn: () =>
      fetch(WISHLIST_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items),
  })

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation<any, Error, string, any>({
    mutationFn: (productId) =>
      fetch(`/api/update-wishlist`, {
        method: 'POST',
        body: JSON.stringify({ productId }),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    onMutate: async (productId) => {
      console.log('onMutate')
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [WISHLIST_QUERY_KEY] })

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData<string[]>([
        WISHLIST_QUERY_KEY,
      ])

      // Optimistically update to the new value
      queryClient.setQueryData<string[]>([WISHLIST_QUERY_KEY], (old) =>
        old && old
          ? old.includes(String(productId))
            ? old.filter((id) => id !== String(productId))
            : old.concat(String(productId))
          : [],
      )

      // Return a context object with the snapshotted value
      return { previousWishlist }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData([WISHLIST_QUERY_KEY], context?.previousWishlist)
    },
    onSuccess: () => {
      console.log('onSuccess')
      queryClient.invalidateQueries({
        queryKey: [WISHLIST_QUERY_KEY],
      })
    },
  })

  console.log(wishlist)
  const isWished =
    wishlist != null && productId != null
      ? wishlist.includes(String(productId))
      : false

  return (
    <>
      {product != null && productId != null ? (
        <div className="p-24 flex flex-row">
          <div style={{ maxWidth: 600, marginRight: 52 }}>
            <Carousel
              animation="fade"
              withoutControls
              wrapAround
              slideIndex={selectImageIndex}
            >
              {product.images.map((url, idx) => (
                <Image
                  key={`${url}-carousel-${idx}`}
                  src={url}
                  alt="image"
                  width={600}
                  height={600}
                  layout="responsive"
                />
              ))}
            </Carousel>
            <div className="flex space-x-4 mt-2">
              {product?.images.map((url, idx) => (
                <div
                  key={`${url}-thumbs-${idx}}`}
                  onClick={() => setSelectImageIndex(idx)}
                >
                  <Image src={url} alt="image" width={100} height={100} />
                </div>
              ))}
            </div>
            {editorState != null && (
              <CustomEditor editorState={editorState} readOnly />
            )}
          </div>
          <div style={{ maxWidth: 600 }} className="flex flex-col space-y-6">
            <div className="text-lg text-zinc-400">
              {CATEGORY_MAP[product.category_id - 1]}
            </div>
            <div className="text-4xl font-semibold">{product.name}</div>
            <div className="text-lg">
              {product.price.toLocaleString('ko-kr')}원
            </div>
            <Button
              // loading={isPending}
              disabled={wishlist == null}
              leftIcon={
                isWished ? (
                  <IconHeart size={20} stroke={1.5} />
                ) : (
                  <IconHeartbeat size={20} stroke={1.5} />
                )
              }
              style={{ backgroundColor: isWished ? 'red' : 'grey' }}
              radius="xl"
              size="md"
              styles={{
                root: { paddingRight: 14, height: 48 },
              }}
              onClick={() => {
                if (session == null) {
                  alert('로그인이 필요해요')
                  router.push(`/auth/login`)
                  return
                }

                mutate(String(productId))
              }}
            >
              찜하기
            </Button>
            <div className="text-sm text-zinc-300">
              등록: {format(new Date(product.createdAt), 'yyyy년 M월 d일')}
            </div>
          </div>
        </div>
      ) : (
        <div>로딩중</div>
      )}
    </>
  )
}
