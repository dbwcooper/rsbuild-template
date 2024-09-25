import { useIntl } from 'react-intl'
import { messages } from './message'

export default function Home() {
  const intl = useIntl()
  return <div>{intl.formatMessage(messages.hello)}</div>
}
