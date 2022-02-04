import { useEffect, useState, useCallback } from 'react'
import { PublicKey, Connection } from '@solana/web3.js'
import styled from '@emotion/styled'
import { AwesomeQR } from 'awesome-qr'
import { claimLinks } from '@cardinal/token-manager'
import { TokenData } from 'api/api'
import { LoadingSpinner } from 'rental-components/common/LoadingSpinner'
import { Wallet } from '@saberhq/solana-contrib'

const BASE_URL = 'https://app.cardinal.so/scan'

const getLink = (serializedUsage: string) => {
  return `${BASE_URL}?tx=${encodeURIComponent(serializedUsage)}${
    new URLSearchParams(window.location.search).get('cluster')
      ? `&cluster=${new URLSearchParams(window.location.search).get('cluster')}`
      : ''
  }`
}

export const QRCode = ({
  connection,
  wallet,
  tokenData,
  cluster,
}: {
  connection?: Connection
  wallet?: Wallet
  tokenData?: TokenData
  cluster?: string
}) => {
  const [qrCode, setQrCode] = useState<any | null>(null)
  const getQRCode = useCallback(async () => {
    if (wallet && connection) {
      try {
        const transaction = await claimLinks.useTransaction(
          connection,
          wallet,
          tokenData?.tokenManager?.parsed.mint,
          1
        )
        transaction.feePayer = wallet.publicKey
        transaction.recentBlockhash = (
          await connection.getRecentBlockhash('max')
        ).blockhash
        await wallet.signTransaction(transaction)
        const serializedUsage = transaction.serialize().toString('base64')
        console.log(getLink(serializedUsage))
        const qrbuffer = await new AwesomeQR({
          text: getLink(serializedUsage),
          colorDark: '#000000',
          colorLight: '#555555',
          backgroundDimming: 'rgba(0, 0, 0, 4)',
          margin: 0,
        }).draw()
        // @ts-ignore
        setQrCode(qrbuffer)
      } catch (e) {
        console.log(e)
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(
      (function getQRCodeInterval(): any {
        getQRCode()
        return getQRCodeInterval
      })(),
      10000
    )
    return () => clearInterval(interval)
  }, [getQRCode])

  if (!wallet) {
    return <div>Connect wallet to scan</div>
  }

  if (!tokenData) {
    return <div>Token not found</div>
  }

  return qrCode ? (
    <QRCodeOuter>
      <img height="300px" src={qrCode} alt="qr-code" />
    </QRCodeOuter>
  ) : (
    <LoadingSpinner />
  )
}

const QRCodeOuter = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    border-radius: 30px;
    padding: 10px;
  }
`
