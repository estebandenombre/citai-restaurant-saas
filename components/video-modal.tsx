"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ExternalLink } from 'lucide-react'

interface VideoModalProps {
  videoId: string
  title?: string
  children: React.ReactNode
}

export function VideoModal({ videoId, title = "Demo Video", children }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 bg-black rounded-2xl shadow-2xl border border-gray-800">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        
        {/* Video Container */}
        <div className="relative w-full h-full">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border border-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          
          {/* Video */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
            title={title}
            className="w-full h-full rounded-2xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          
          {/* YouTube Button Overlay */}
          <div className="absolute bottom-4 left-4">
            <Button
              variant="secondary"
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-lg border border-white/20"
              onClick={openYouTube}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver en YouTube
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
