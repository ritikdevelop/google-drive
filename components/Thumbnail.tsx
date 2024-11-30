"use client";

import React from 'react'

interface Props {
    type: string,
    extension: string,
    url?: string
}

const Thumbnail = ({type, extension, url = ""}: Props) => {
  return (
    <div>Thumbnail</div>
  )
}

export default Thumbnail