import { Link } from 'react-router-dom'

interface LogoProps {
  to?: string | null
  showWordmark?: boolean
  className?: string
}

export function Logo({
  to = '/',
  showWordmark = true,
  className = '',
}: LogoProps) {
  const content = (
    <>
      <img
        src="/gpex-logo.jpg"
        alt=""
        className="logo-img"
        width={40}
        height={40}
      />
      {showWordmark && <span className="logo-text">GpexLog</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`logo ${className}`.trim()} aria-label="GpexLog">
        {content}
      </Link>
    )
  }

  return (
    <div className={`logo ${className}`.trim()} aria-label="GpexLog">
      {content}
    </div>
  )
}
