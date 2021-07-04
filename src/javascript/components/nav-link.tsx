import React from 'react'
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom'
import ApplyPrefixStyles from 'javascript/components/apply-prefix-styles'


interface Props extends NavLinkProps {
  className?: string
  ignorePrefixing?: boolean
  href?: string
  target?: string
  classesToPrefix?: string[]
  [key: string]: any
}


const NavLink: React.FC<Props> = ({
  children,
  className = '',
  href,
  ignorePrefixing,
  classesToPrefix,
  ...props
}) => (

  <ApplyPrefixStyles
    providedClassNames={className}
    classesToPrefix={classesToPrefix || ['button']}
    ignorePrefixing={ignorePrefixing}
    renderProp={(classNames) => {
      if (href) {
        return (
          <a {...props} href={href} className={classNames}>
            {children}
          </a>
        )
      }
      return (
        < RouterNavLink
          {...props}
          {...(classNames.trim().length && { className: classNames })}
        >
          {children}
        </ RouterNavLink>
      )
    }}
  />
)

export default NavLink