import { CLIENT_ID } from '@/constants/googleAuth'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'

export default function GoogleOAuth() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="flex">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log(credentialResponse)
            fetch(
              `/api/auth/sign-in?credential=${credentialResponse.credential}`,
            )
              .then((res) => res.json())
              .then((data) => console.log(data))
          }}
          onError={() => {
            console.log('Login Failed')
          }}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  )
}
