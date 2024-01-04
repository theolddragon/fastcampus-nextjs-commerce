import { useCallback, useEffect, useState } from 'react'
import { products } from '@prisma/client'
import Image from 'next/image'
import { css } from '@emotion/react'
import { CATEGORY_MAP, TAKE } from '@/constants/products'

export default function Products() {
  const [skip, setSkip] = useState(0)
  const [products, setProducts] = useState<products[]>([])

  useEffect(() => {
    fetch(`/api/get-products?skip=0&take=${TAKE}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items))
  }, [])

  const getProducts = useCallback(() => {
    const next = skip + TAKE
    fetch(`/api/get-products?skip=${next}&take=${TAKE}`)
      .then((res) => res.json())
      .then((data) => {
        const list = products.concat(data.items)
        setProducts(list)
      })
    setSkip(next)
  }, [skip, products])

  return (
    <div className="mt-36 mb-36">
      {products && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((product) => (
            <div key={product.id}>
              <Image
                src={product.image_url ?? ''}
                className="rounded"
                width={300}
                height={200}
                alt={product.name}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8wfCtHgAGFQJfiNtrFQAAAABJRU5ErkJggg=="
              />
              <div className="flex">
                <span>{product.name}</span>
                <span className="ml-auto">
                  {product.price.toLocaleString('ko-KR')}원
                </span>
              </div>
              <span className="text-zinc-400">
                {CATEGORY_MAP[product.category_id - 1]}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        className="w-full rounded mt-20 bg-zinc-200 p-4"
        onClick={getProducts}
      >
        더보기
      </button>
    </div>
  )
}
