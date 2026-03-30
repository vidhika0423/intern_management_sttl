import SessionWrapper from '@/utils/SessionWrapper'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'InternOS',
  description: 'Intern Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <div>
          <SessionWrapper>
          <main>
            {children}
          </main>
          </SessionWrapper>
        </div>
      </body>
    </html>
  )
}