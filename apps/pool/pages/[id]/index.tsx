import { shortenAddress } from '@sushiswap/format'
import { AppearOnMount, BreadcrumbLink } from '@sushiswap/ui'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { FC } from 'react'
import useSWR, { SWRConfig } from 'swr'

import {
  Layout,
  PoolActionBar,
  PoolButtons,
  PoolChart,
  PoolComposition,
  PoolHeader,
  PoolMyRewards,
  PoolPosition,
  PoolPositionProvider,
  PoolPositionRewardsProvider,
  PoolPositionStakedProvider,
  PoolRewards,
  PoolStats,
} from '../../components'
import { getPool } from '../../lib/api'
import { PairWithAlias } from '../../types'

const LINKS = (id: string): BreadcrumbLink[] => [
  {
    href: `/${id}`,
    label: `${shortenAddress(id.split(':')[1])}`,
  },
]

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  // res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')
  const id = query.id as string
  const pair = await getPool(id)
  return {
    props: {
      fallback: {
        [`/pool/api/pool/${id}`]: pair,
      },
    },
  }
}

const Pool: FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ fallback }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <_Pool />
    </SWRConfig>
  )
}

const fetcher = (url) =>
  fetch(url)
    .then((response) => response.json())
    .catch((error) => console.log('fetcher error', error))

const _Pool = () => {
  const router = useRouter()
  const { data: pair } = useSWR<PairWithAlias>(router.query.id ? `/pool/api/pool/${router.query.id}` : null, fetcher)

  if (!pair) return <></>

  return (
    <PoolPositionProvider pair={pair}>
      <PoolPositionStakedProvider pair={pair}>
        <PoolPositionRewardsProvider pair={pair}>
          <Layout breadcrumbs={LINKS(router.query.id as string)}>
            <div className="flex flex-col lg:grid lg:grid-cols-[568px_auto] gap-12">
              <div className="flex flex-col order-1 gap-9">
                <PoolHeader pair={pair} />
                <hr className="my-3 border-t border-slate-200/5" />
                <PoolChart pair={pair} />
                <AppearOnMount>
                  <PoolStats pair={pair} />
                </AppearOnMount>
                <PoolComposition pair={pair} />
                <PoolRewards pair={pair} />
              </div>

              <div className="flex flex-col order-2 gap-4">
                <AppearOnMount>
                  <div className="flex flex-col gap-10">
                    <PoolMyRewards pair={pair} />
                    <PoolPosition pair={pair} />
                  </div>
                </AppearOnMount>
                <div className="hidden lg:flex">
                  <PoolButtons pair={pair} />
                </div>
              </div>
            </div>
          </Layout>
          <PoolActionBar pair={pair} />
        </PoolPositionRewardsProvider>
      </PoolPositionStakedProvider>
    </PoolPositionProvider>
  )
}

export default Pool
