import { useCallback, useEffect, useState } from 'react'
import { categories, products } from '@prisma/client'
import Image from 'next/image'
import { css } from '@emotion/react'
import { IconSearch } from '@tabler/icons-react'
import { Input, Pagination, SegmentedControl, Select } from '@mantine/core'
import { CATEGORY_MAP, FILTERS, TAKE } from '@/constants/products'
import useDebounce from '@/hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activePage, setPage] = useState(1)
  const [selectedCategory, setCategory] = useState<string>('-1')
  const [selectedFilter, setFilter] = useState<string | null>(FILTERS[0].value)
  const [keyword, setKeyword] = useState('')

  const debouncedKeyword = useDebounce<string>(keyword)

  const { data: categories } = useQuery<
    { items: categories[] },
    unknown,
    categories[]
  >({
    queryKey: ['/api/get-categories'],
    queryFn: () => fetch('/api/get-categories').then((res) => res.json()),
    select: (data) => data.items,
  })

  const { data: total } = useQuery<{ items: number }, unknown, number>({
    queryKey: [
      `/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`,
    ],
    queryFn: () =>
      fetch(
        `/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`,
      ).then((res) => res.json()),
    select: (data) => Math.ceil(data.items / TAKE),
  })

  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >({
    queryKey: [
      `/api/get-products
      ?skip=${TAKE * (activePage - 1)}
      &take=${TAKE}
      &category=${selectedCategory}
      &orderBy=${selectedFilter}
      &contains=${debouncedKeyword}`,
    ],
    queryFn: () =>
      fetch(
        `/api/get-products?skip=${
          TAKE * (activePage - 1)
        }&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedKeyword}`,
      ).then((res) => res.json()),
    select: (data) => data.items,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  return (
    <div className="mt-36 mb-36">
      <div className="mb-4">
        <Input
          icon={<IconSearch />}
          placeholder="Search"
          value={keyword}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <Select value={selectedFilter} onChange={setFilter} data={FILTERS} />
      </div>
      {categories && (
        <div className="mb-4">
          <SegmentedControl
            value={selectedCategory}
            onChange={setCategory}
            data={[
              { label: 'ALL', value: '-1' },
              ...categories.map((category) => ({
                label: category.name,
                value: String(category.id),
              })),
            ]}
            color="dark"
          />
        </div>
      )}
      {products && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              style={{ maxWidth: 310 }}
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <Image
                src={product.image_url ?? ''}
                className="rounded"
                width={310}
                height={390}
                alt={product.name}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0tbSsBwACegEoriWGfgAAAABJRU5ErkJggg=="
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
      <div className="w-full flex mt-5">
        <Pagination
          value={activePage}
          onChange={setPage}
          total={total ?? 0}
          className="m-auto"
        />
      </div>
    </div>
  )
}
