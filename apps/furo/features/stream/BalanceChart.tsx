import { Group } from '@visx/group'
import { Pie } from '@visx/shape'
import { Text } from '@visx/text'
import { BigNumber } from 'ethers'
import { FC, useEffect, useState } from 'react'
import { useContract, useSigner } from 'wagmi'
import FuroStreamABI from '../../abis/FuroStream.json'
import { Stream } from './context/Stream'

interface Props {
  stream: Stream
}
const BalanceChart: FC<Props> = (props) => {
  const stream = props.stream
  const [balance, setBalance] = useState(null)
  const [{ data, error, loading }, getSigner] = useSigner()
  const [streamed, setStreamed] = useState([])
  const contract = useContract({
    addressOrName: '0x511D5aef6eb2eFDf71b98B4261Bbe68CC0A94Cd4',
    contractInterface: FuroStreamABI,
    signerOrProvider: data,
  })

  useEffect(() => {
    if (!data || !contract || !stream.id) {
      return
    }
    const fetchBalance = async () => {
      const result = await contract.streamBalanceOf(stream.id)
      const balance = result.recipientBalance as BigNumber
      setBalance(balance.toNumber())
    }
    fetchBalance()
  }, [contract, stream.id, data])

  useEffect(() => {
    if (!stream.amount && !balance) {
      setStreamed([
        { type: 'Streamed', amount: balance, color: '#0033ad' },
        { type: 'Withdrawn', amount: stream.withdrawnAmount.toNumber(), color: 'red' },
        { type: 'Total', amount: stream.amount.sub(balance).toNumber(), color: 'grey' },
      ])
    }
  }, [balance, stream.amount, stream.withdrawnAmount])

  const width = 550
  const half = width / 2
  const [active, setActive] = useState(null)

  if (!streamed) {
    return
  }

  return (
    <svg width={width} height={width}>
      <Group top={half} left={half}>
        <Pie
          data={streamed}
          pieSort={null}
          pieValue={(data) => data.amount}
          outerRadius={half}
          innerRadius={() => {
            const size = 10
            return half - size
          }}
          padAngle={0.01}
        >
          {(pie) => {
            return pie.arcs.map((arc) => {
              return (
                <g key={arc.data.type} onMouseEnter={() => setActive(arc.data)} onMouseLeave={() => setActive(null)}>
                  <path d={pie.path(arc)} fill={arc.data.color} />
                </g>
              )
            })
          }}
        </Pie>

        {active ? (
          <>
            <Text textAnchor="middle" fill="#fff" fontSize={40} dy={-20}>
              {Math.floor(active.amount)}
            </Text>
            <Text textAnchor="middle" fill={active.color} fontSize={20} dy={20}>
              {active.type}
            </Text>
          </>
        ) : (
          <>
            <Text textAnchor="middle" fill="#fff" fontSize={40} dy={-20}>
              {balance}
            </Text>
            <Text textAnchor="middle" fill="#aaa" fontSize={20} dy={20}>
              {balance}
            </Text>
          </>
        )}
      </Group>
    </svg>
  )
}
export default BalanceChart