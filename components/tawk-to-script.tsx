"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export default function TawkToScript() {
  const pathname = usePathname()
  
  // Don't show chat on dashboard pages
  const isDashboardPage = pathname?.startsWith('/dashboard')
  
  if (isDashboardPage) {
    return null
  }

  return (
    <Script
      id="tawk-to-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/68aeb93fc7e55d19240e116b/1j3l878np';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  )
}
