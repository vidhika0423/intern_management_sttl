import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'InternOS',
  description: 'Intern Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{
            flex: 1,
            marginLeft: '240px',
            padding: '36px 40px',
            maxWidth: '1200px',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}