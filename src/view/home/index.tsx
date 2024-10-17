import { useIntl } from 'react-intl'
import { messages } from './message'
import styles from './index.module.scss'

export default function Home() {
  const intl = useIntl()
  
  return <div className={styles.bg}>{intl.formatMessage(messages.hello)}</div>
}
