import { SlideElementSchema } from '@/lib/StoreTypes'

// Styling from this lad: https://www.youtube.com/watch?v=voXlG_U3sVc

const VideoElement = ({
  element,
  isThumbnail,
}: {
  element: SlideElementSchema
  presentationIndex: number
  slideIndex: number
  slideElementIndex: number
  isThumbnail: boolean
}) => {
  if (element.type !== 'video') {
    return <>This shouldn't happen based on how component is rendered, its just to make typescript happy</>
  }

  return isThumbnail ? (
    <img className="object-contain" src={`https://img.youtube.com/vi/${element.id}/sddefault.jpg`} alt='youtube video thumbnail' data-cy='videothumbnail'/>
  ) : (
    <div className="relative w-full h-full ">
      <div className="h-0 pt-[56.25%]">
        <iframe
          className="w-full h-full absolute top-0 left-0"
          src={`https://www.youtube-nocookie.com/embed/${element.id}?autoplay=${element.auto ? 1 : 0}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}

export default VideoElement
