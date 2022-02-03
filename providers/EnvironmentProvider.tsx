import React, { useMemo, useState, useContext } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'

export interface Environment {
  label: string
  value: string
  programId: PublicKey
  utilityMint?: PublicKey
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
    programId: new PublicKey('QtZ75QiTxebPVnZ5Wr181ZRrqcmiinpFem7oPpGbGxp'),
  },
  {
    label: 'testnet',
    value: 'https://api.testnet.solana.com',
    programId: new PublicKey('QtZ75QiTxebPVnZ5Wr181ZRrqcmiinpFem7oPpGbGxp'),
    utilityMint: new PublicKey('FSEuiPuTgqSbLbC89jgZ3umR6meYa69JwK7qVqayvjow'),
  },
  {
    label: 'devnet',
    value: 'https://api.devnet.solana.com',
    programId: new PublicKey('QtZ75QiTxebPVnZ5Wr181ZRrqcmiinpFem7oPpGbGxp'),
    utilityMint: new PublicKey('J68Fquq5EQ4hnYPEo68DWC6bbxBGPQUDqMFmFV5nhCrj'),
  },
  {
    label: 'localnet',
    value: 'http://127.0.0.1:8899',
    programId: new PublicKey('QtZ75QiTxebPVnZ5Wr181ZRrqcmiinpFem7oPpGbGxp'),
    utilityMint: new PublicKey('62JGbV4wX3EmKkSNDFiqq18bAMwzhG5VDrZVGZjwWwSP'),
  },
]

const EnvironmentContext: React.Context<null | EnvironmentContextValues> =
  React.createContext<null | EnvironmentContextValues>(null)

export function EnvironmentContextProvider({
  children,
}: {
  children: React.ReactChild
}) {
  // could be used by environment selector
  const [environment, setEnvironment] = useState(ENVIRONMENTS[0])

  // only update connection if environment changes
  const connection = useMemo(
    () => new Connection(environment.value, 'recent'),
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
