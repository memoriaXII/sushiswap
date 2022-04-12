import { FC } from 'react'
import { getBuiltGraphSDK } from '../../../../.graphclient'
import { RawStream } from 'app/features/stream/context/types'
import { Typography } from 'ui/typography'
import StreamTable from 'app/features/stream/StreamTable'
import Layout from 'app/components/Layout'

interface StreamsProps {
  incomingStreams: RawStream[]
  outgoingStreams: RawStream[]
}

const Streams: FC<StreamsProps> = ({ incomingStreams, outgoingStreams }) => {
  return (
    <Layout>
      <div className="flex flex-col h-full gap-12 pt-40">
        <Typography variant="h2" weight={700} className="text-high-emphesis">
          Dashboard
        </Typography>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <Typography variant="lg" weight={700} className="text-high-emphesis">
              Incoming streams
            </Typography>
            <StreamTable streams={incomingStreams} />
          </div>

          <div className="flex flex-col gap-5">
            <Typography variant="lg" weight={700} className="text-high-emphesis">
              Outgoing streams
            </Typography>
            <StreamTable streams={outgoingStreams} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Streams

export async function getServerSideProps({ query }) {
  const sdk = await getBuiltGraphSDK()
  const user = (await sdk.UserStreams({ id: query.address })).STREAM_user
  return {
    props: user,
  }
}