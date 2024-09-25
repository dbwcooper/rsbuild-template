import { createContext, useEffect, useMemo, useState } from "react"
import { IntlProvider } from "react-intl"
import { I18N_CODE } from "./lib/i18n"

interface AppIntlContextProps {
  locale: I18N_CODE
  setLocale: (locale: I18N_CODE) => void
}

const AppIntlContext = createContext<AppIntlContextProps>({
  locale: I18N_CODE.EN_US,
  setLocale: () => { },
})

const getDefalutMessages = async (locale: I18N_CODE): Promise<Record<string, string>> => {
  return await import(`./assets/i18n/${locale}.json`).then((res) => res.default)
}


const AppConfigIntl = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<I18N_CODE>(I18N_CODE.EN_US)
  const [messages, setMessages] = useState<Record<string, string>>({})

  useEffect(() => {
    getDefalutMessages(locale).then(setMessages)
  }, [locale])

  const ctxValue = useMemo(() => ({
    locale,
    setLocale,
  }), [locale])

  return (
    <AppIntlContext.Provider value={ctxValue}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </AppIntlContext.Provider>
  )
}


export default AppConfigIntl
