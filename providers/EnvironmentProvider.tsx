import React, { useMemo, useState, useContext } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'

export interface Environment {
  label: string
  value: string
}

export interface EnvironmentContextValues {
  environment: Environment
  setEnvironment: (newEnvironment: Environment) => void
  connection: Connection
}

export const ENVIRONMENTS: Environment[] = [
  {
    label: 'mainnet',
    value: 'https://ssc-dao.genesysgo.net',
  },
  {
    label: 'testnet',
    value: 'https://api.testnet.solana.com',
  },
  {
    label: 'devnet',
    value: 'https://api.devnet.solana.com',
  },
  {
    label: 'localnet',
    value: 'http://127.0.0.1:8899',
  },
]

const EnvironmentContext: React.Context<null | EnvironmentContextValues> =
  React.createContext<null | EnvironmentContextValues>(null)

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactChild
}) {
  const router = useRouter()
  const cluster = router.query.cluster || process.env.BASE_CLUSTER
  const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
  const [environment, setEnvironment] = useState(
    foundEnvironment ?? ENVIRONMENTS[0]
  )

  useMemo(() => {
    const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
    setEnvironment(foundEnvironment ?? ENVIRONMENTS[2])
  }, [cluster])

  const connection = useMemo(
    () => new Connection(environment.value, { commitment: 'recent' }),
    [environment]
  )

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
        connection,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironmentCtx(): EnvironmentContextValues {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return context
}
