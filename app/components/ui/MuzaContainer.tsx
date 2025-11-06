import React, { type ReactNode } from 'react'

import styles from './MuzaContainer.module.css'

interface MuzaContainerProps {
  children: ReactNode | ReactNode[]
}

const MuzaContainer: React.FC<MuzaContainerProps> = ({ children }) => {
  return <div className={styles['muza-container']}> {children} </div>
}

export default MuzaContainer
