import GoogleLogin from '@components/GoogleLogin'

export default function Login() {
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: '5px',
      }}
    >
      <GoogleLogin />
    </div>
  )
}
