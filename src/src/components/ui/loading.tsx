import React from 'react'
import './loading.css'

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </div>
  )
}
