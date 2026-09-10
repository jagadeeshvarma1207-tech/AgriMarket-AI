'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: { url: string; altText?: string | null }[]
  fallback?: string
}

export function ImageCarousel({ images, fallback = '🌾' }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="image-carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
        {fallback}
      </div>
    )
  }

  return (
    <div className="image-carousel">
      <img
        src={images[current].url}
        alt={images[current].altText || 'Product image'}
        className="carousel-img"
      />
      {images.length > 1 && (
        <>
          <button className="carousel-nav prev" onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}>
            <ChevronLeft size={18} />
          </button>
          <button className="carousel-nav next" onClick={() => setCurrent((c) => (c + 1) % images.length)}>
            <ChevronRight size={18} />
          </button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
