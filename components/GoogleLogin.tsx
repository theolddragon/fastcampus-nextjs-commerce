import { useSession, signIn, signOut } from 'next-auth/react'
import Button from './Button'

export default function GoogleLogin() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        <span>Signed in as {session.user?.email} </span>
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    )
  }
  return (
    <>
      <span>Not signed in </span>
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  )
}
